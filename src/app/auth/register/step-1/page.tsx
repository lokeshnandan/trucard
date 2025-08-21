"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button, ErrorText, Input, Label } from "@/app/components/ui";
import { emailSchema, mobileSchema, otpSchema } from "@/lib/validators";
import { createRegistration, verifyOtp, generateEmailKycOtp } from "@/lib/api";
import { useState } from "react";
import Stepper from "@/app/components/ui/Stepper";

const schema = z.object({
  mobile: mobileSchema,
  email: emailSchema,
  smsOtp: otpSchema.optional(),
  emailOtp: otpSchema.optional(),
});

type Values = z.infer<typeof schema>;

export default function RegisterStep1() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { mobile: "", email: "" },
  });

  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [smsOtpSent, setSmsOtpSent] = useState(false);

  const [loadingSmsOtp, setLoadingSmsOtp] = useState(false);
  const [loadingEmailOtp, setLoadingEmailOtp] = useState(false);

  const [smsVerified, setSmsVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [verifyingSms, setVerifyingSms] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);

  const [emailOtpRef, setEmailOtpRef] = useState<string | null>(null);

  async function onSendSmsOtp() {
    setLoadingSmsOtp(true);
    try {
      const mobile = (document.querySelector('input[name="mobile"]') as HTMLInputElement)?.value;
      const response = await createRegistration(mobile);
      if (response.success) {
        // createRegistration stores ref_id and shows otp toast from api helper
        setSmsOtpSent(true);
      } else {
        alert(`Failed to create registration: ${response.error}`);
      }
    } finally {
      setLoadingSmsOtp(false);
    }
  }

  async function handleVerifySmsOtp() {
    const otp = getValues("smsOtp")?.trim();
    if (!otp) {
      alert("Please enter the SMS OTP.");
      return;
    }
    setVerifyingSms(true);
    try {
      const res = await verifyOtp({ otp }, "mobile"); // explicitly verify mobile OTP
      const ok = Boolean(res.success && res.data?.verified);
      setSmsVerified(ok);
      if (!ok) {
        alert(res.error || "SMS OTP verification failed.");
      }
      // on success, API helper stores urn and shows toast
    } catch (err) {
      alert("An error occurred while verifying SMS OTP.");
    } finally {
      setVerifyingSms(false);
    }
  }

  async function onSendEmailOtp() {
    setLoadingEmailOtp(true);
    try {
      const email = getValues("email")?.trim();
      if (!email) {
        alert("Please enter an email address.");
        return;
      }
      const response = await generateEmailKycOtp(email);
      if (response.success) {
        // capture reference returned for email OTP verification
        const ref = (response.data as any)?.reference as string | undefined;
        if (ref) {
          setEmailOtpRef(ref);
          localStorage.setItem("email_otp_reference", ref);
        }
        setEmailOtpSent(true);
      } else {
        alert(`Failed to send Email OTP: ${response.error}`);
      }
    } finally {
      setLoadingEmailOtp(false);
    }
  }

  async function handleVerifyEmailOtp() {
    const otp = getValues("emailOtp")?.trim();
    if (!otp) {
      alert("Please enter the Email OTP.");
      return;
    }
    setVerifyingEmail(true);
    try {
      const reference = emailOtpRef ?? localStorage.getItem("email_otp_reference") ?? undefined;
      const res = await verifyOtp({ otp, reference }, "email");
      const ok = Boolean(res.success && res.data?.verified);
      setEmailVerified(ok);
      if (!ok) {
        alert(res.error || "Email OTP verification failed.");
      }
    } catch (err) {
      alert("An error occurred while verifying Email OTP.");
    } finally {
      setVerifyingEmail(false);
    }
  }

  return (
    <div
      className="grid gap-6"
      style={{
        marginBlock: "40px",
      }}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="h-12 w-12 rounded-2xl bg-[var(--tc-primary)]/10 grid place-items-center">
          <div className="h-6 w-6 rounded-xl bg-[var(--tc-primary)]" />
        </div>
        <span
          className="bg-blue-100"
          style={{
            borderRadius: "20px",
            fontWeight: "500",
            color: "#2563eb",
            fontSize: "12px",
            paddingBlock: "6px",
            paddingInline: "12px",
          }}
        >
          Registration
        </span>
        <Stepper step={1} />

        <h1 className="text-xl font-semibold">Create Account</h1>
        <p className="text-sm text-slate-600">Step 1 of 3 - Verify contact details</p>
      </div>

      <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
        <div className="grid gap-1">
          <Label>Mobile Number</Label>
          <div className="flex gap-2">
            <Input placeholder="9876543210" {...register("mobile")} />
            <Button type="button" onClick={onSendSmsOtp} loading={loadingSmsOtp} className="px-4">
              {smsOtpSent ? "Resend OTP" : "Send OTP"}
            </Button>
          </div>
          <ErrorText>{errors.mobile?.message}</ErrorText>
        </div>

        {smsOtpSent && (
          <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
            <div className="grid gap-1">
              <Label>Enter SMS OTP</Label>
              <div className="flex gap-2 items-center">
                <Input placeholder="123456" maxLength={6} {...register("smsOtp")} />
                {smsVerified ? (
                  <div className="h-10 w-10 rounded-lg bg-emerald-600 grid place-items-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ) : (
                  <Button type="button" onClick={handleVerifySmsOtp} loading={verifyingSms} className="px-4">
                    Verify
                  </Button>
                )}
              </div>
              <ErrorText>{errors.smsOtp?.message}</ErrorText>
              {smsVerified && <p className="text-sm text-emerald-600">Mobile verified</p>}
            </div>
          </div>
        )}

        <div className="grid gap-1">
          <Label>Email Address</Label>
          <div className="flex gap-2">
            <Input placeholder="email@example.com" {...register("email")} />
            <Button type="button" onClick={onSendEmailOtp} loading={loadingEmailOtp} className="px-4">
              {emailOtpSent ? "Resend OTP" : "Send OTP"}
            </Button>
          </div>
          <ErrorText>{errors.email?.message}</ErrorText>
        </div>

        {emailOtpSent && (
          <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
            <div className="grid gap-1">
              <Label>Enter Email OTP</Label>
              <div className="flex gap-2 items-center">
                <Input placeholder="123456" maxLength={6} {...register("emailOtp")} />
                {emailVerified ? (
                  <div className="h-10 w-10 rounded-lg bg-emerald-600 grid place-items-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ) : (
                  <Button type="button" onClick={handleVerifyEmailOtp} loading={verifyingEmail} className="px-4">
                    Verify
                  </Button>
                )}
              </div>
              <ErrorText>{errors.emailOtp?.message}</ErrorText>
              {emailVerified && <p className="text-sm text-emerald-600">Email verified</p>}
            </div>
          </div>
        )}

        {/* Proceed only when both SMS and Email are verified */}
        {smsVerified && emailVerified && (
          <Link href="/auth/register/step-2" className="h-11 rounded-md bg-emerald-600 text-white grid place-items-center">
            Proceed to Step 2
          </Link>
        )}
      </form>
    </div>
  );
}
