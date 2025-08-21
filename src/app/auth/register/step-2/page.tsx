"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { aadhaarSchema, panSchema, otpSchema } from "@/lib/validators";
import { Button, ErrorText, Input, Label } from "@/app/components/ui";
import { sendOtp, generateAadhaarOtp, verifyAadhaarOtp, verifyPanNumber } from "@/lib/api";
import { useState } from "react";
import Stepper from "@/app/components/ui/Stepper";

const schema = z.object({
  aadhaar: aadhaarSchema,
  pan: panSchema,
  aadhaarOtp: otpSchema.optional(),
  panOtp: otpSchema.optional(),
});

type Values = z.infer<typeof schema>;

export default function RegisterStep2() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<Values>({ resolver: zodResolver(schema) });

  // Aadhaar OTP states
  const [aadhaarOtpSent, setAadhaarOtpSent] = useState(false);
  const [loadingAadhaarOtp, setLoadingAadhaarOtp] = useState(false);
  const [verifyingAadhaar, setVerifyingAadhaar] = useState(false);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);

  // PAN OTP states
  const [panOtpSent, setPanOtpSent] = useState(false);
  const [loadingPanOtp, setLoadingPanOtp] = useState(false);
  const [verifyingPan, setVerifyingPan] = useState(false);
  const [panVerified, setPanVerified] = useState(false);

  // send OTP for Aadhaar (button next to Aadhaar input)
  async function onSendAadhaarOtp() {
    setLoadingAadhaarOtp(true);
    try {
      const aadhaar = getValues("aadhaar")?.trim();
      if (!aadhaar) {
        alert("Please enter Aadhaar number.");
        return;
      }
      const response = await generateAadhaarOtp(aadhaar);
      if (response.success) {
        setAadhaarOtpSent(true);
      } else {
        alert(`Failed to send Aadhaar OTP: ${response.error}`);
      }
    } catch (err) {
      alert("An error occurred while sending Aadhaar OTP.");
    } finally {
      setLoadingAadhaarOtp(false);
    }
  }

  // verify Aadhaar OTP (button next to Aadhaar OTP input)
  async function onVerifyAadhaarOtp() {
    const otp = getValues("aadhaarOtp")?.trim();
    if (!otp) {
      alert("Please enter the Aadhaar OTP.");
      return;
    }
    setVerifyingAadhaar(true);
    try {
      const res = await verifyAadhaarOtp(otp);
      const ok = Boolean(res.success && res.data?.verified);
      setAadhaarVerified(ok);
      if (!ok) {
        alert(res.error || "Invalid Aadhaar OTP. Use 123456 for demo.");
      }
    } catch (err) {
      alert("An error occurred while verifying Aadhaar OTP.");
    } finally {
      setVerifyingAadhaar(false);
    }
  }

  // send OTP for PAN (button next to PAN input)
  async function onSendPanOtp() {
    setLoadingPanOtp(true);
    try {
      const pan = getValues("pan")?.trim();
      if (!pan) {
        alert("Please enter PAN number.");
        return;
      }
      const response = await sendOtp({ aadhaar: pan });
      if (response.success) {
        setPanOtpSent(true);
      } else {
        alert(`Failed to send PAN OTP: ${response.error}`);
      }
    } catch (err) {
      alert("An error occurred while sending PAN OTP.");
    } finally {
      setLoadingPanOtp(false);
    }
  }

  // verify PAN OTP (button next to PAN OTP input)
  async function onVerifyPanOtp() {
    const pan = getValues("pan")?.trim();
    if (!pan) {
      alert("Please enter PAN number before verifying.");
      return;
    }
    setVerifyingPan(true);
    try {
      const res = await verifyPanNumber(pan);
      const ok = Boolean(res.success && res.data?.verified);
      setPanVerified(ok);
      if (!ok) {
        alert(res.error || "PAN verification failed.");
      }
    } catch (err) {
      alert("An error occurred while verifying PAN.");
    } finally {
      setVerifyingPan(false);
    }
  }

  const bothVerified = aadhaarVerified && panVerified;

  return (
    <div className="grid gap-6">
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
        <Stepper step={2} />

        <h1 className="text-xl font-semibold">KYC Verification</h1>
        <p className="text-sm text-slate-600">Step 2 of 3 - Verify identity</p>
      </div>

      <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
        {/* Aadhaar row: input + Send OTP */}
        <div className="grid gap-1">
          <Label>Aadhaar Number</Label>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="1234 5678 9012"
              maxLength={12}
              {...register("aadhaar")}
            />
            <Button
              type="button"
              onClick={onSendAadhaarOtp}
              loading={loadingAadhaarOtp}
            >
              {aadhaarOtpSent ? "Resend OTP" : "Send OTP"}
            </Button>
          </div>
          <ErrorText>{errors.aadhaar?.message}</ErrorText>
        </div>

        {/* Aadhaar OTP verify row */}
        {aadhaarOtpSent && (
          <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
            <div className="grid gap-1">
              <Label>Enter Aadhaar OTP</Label>
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="123456"
                  maxLength={6}
                  {...register("aadhaarOtp")}
                />
                {aadhaarVerified ? (
                  <div className="h-10 w-10 rounded-lg bg-emerald-600 grid place-items-center">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={onVerifyAadhaarOtp}
                    loading={verifyingAadhaar}
                  >
                    Verify
                  </Button>
                )}
              </div>
              <ErrorText>{errors.aadhaarOtp?.message}</ErrorText>
            </div>
          </div>
        )}

        {/* PAN row: input + Send OTP */}
        <div className="grid gap-1">
          <Label>PAN Number</Label>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="ABCDE1234F"
              maxLength={10}
              {...register("pan")}
            />
            <Button
              type="button"
              onClick={onVerifyPanOtp}
              loading={loadingPanOtp}
            >
              {panVerified ? "Verified" : "Verify Pan"}
            </Button>
            {panVerified && (
              <div className="h-10 w-10 rounded-lg bg-emerald-600 grid place-items-center ml-2">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>
          <ErrorText>{errors.pan?.message}</ErrorText>
        </div>

        {/* PAN OTP verify row */}
        {/* {panOtpSent && (
          <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
            <div className="grid gap-1">
              <Label>Enter PAN OTP</Label>
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="123456"
                  maxLength={6}
                  {...register("panOtp")}
                />
                {panVerified ? (
                  <div className="h-10 w-10 rounded-lg bg-emerald-600 grid place-items-center">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={onVerifyPanOtp}
                    loading={verifyingPan}
                  >
                    Verify
                  </Button>
                )}
              </div>
              <ErrorText>{errors.panOtp?.message}</ErrorText>
            </div>
          </div>
        )} */}

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/auth/register/step-1"
            className="h-11 rounded-md border border-slate-200 grid place-items-center"
          >
            Back
          </Link>
          <Button type="button" loading={false}>
            Continue
          </Button>
        </div>
      </form>

      {bothVerified && (
        <Link
          href="/auth/register/step-3"
          className="h-11 rounded-md bg-emerald-600 text-white grid place-items-center"
        >
          Proceed to Step 3
        </Link>
      )}
    </div>
  );
}
