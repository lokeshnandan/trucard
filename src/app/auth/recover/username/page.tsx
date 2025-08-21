"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button, ErrorText, Input, Label } from "@/app/components/ui";
import { mobileSchema, otpSchema } from "@/lib/validators";
import {
  sendOtp,
  verifyOtp,
  forgotUsername,
  mockSendOtp,
  mockVerifyOtp,
} from "@/lib/api";
import { useState } from "react";
import { Phone } from "lucide-react";

const schema = z.object({
  mobile: mobileSchema,
  otp: otpSchema.optional(),
});

type Values = z.infer<typeof schema>;

export default function ForgotUsername() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSend() {
    setLoading(true);
    try {
      const response = await sendOtp({ mobile: "mobile" });
      if (response.success) {
        setOtpSent(true);
      } else {
        alert(`Failed to send OTP: ${response.error}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function onVerify(values: Values) {
    try {
      const res = await verifyOtp({ otp: values.otp ?? "" }, "mobile");
      if (res.success && res.data?.verified) {
        const usernameRes = await forgotUsername(values.mobile);
        if (usernameRes.success) {
          alert(`Your username is: ${usernameRes.data?.username}`);
        } else {
          alert(`Failed to retrieve username: ${usernameRes.error}`);
        }
      } else {
        alert("Invalid OTP. Use 123456 for demo.");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onGetUsername() {
    const mobile = (
      document.querySelector('input[name="mobile"]') as HTMLInputElement
    )?.value;
    if (!mobile) {
      alert("Please enter your mobile number.");
      return;
    }
    setLoading(true);
    try {
      setOtpSent(true);
      const res = await forgotUsername(mobile);
      if (res.success && res.data?.username) {
        alert(`Your username is: ${res.data.username}`);
      } else {
        alert(`Failed to retrieve username: ${res.error}`);
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="screen-center">
      <div className="w-full max-w-md bg-[var(--tc-card)] rounded-[var(--radius-md)] shadow-sm ring-1 ring-slate-200/70 p-6 pb-20">
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="h-12 w-12 rounded-2xl bg-[var(--tc-primary)]/10 grid place-items-center">
            <div className="h-6 w-6 rounded-xl bg-[var(--tc-primary)]" />
          </div>
          <p
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
            Account Recovery
          </p>
          <h1 className="text-xl font-semibold">Forgot Username?</h1>
          <p className="text-sm text-slate-600">Enter your mobile number</p>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit(onVerify)}>
          <div className="grid gap-1">
            <div className="flex items-center gap-3">
              <Phone size={14} />
              <Label>Mobile Number</Label>
            </div>
            <Input
              placeholder="Enter registered mobile"
              {...register("mobile")}
            />
            <ErrorText>{errors.mobile?.message}</ErrorText>
          </div>
          {otpSent && (
            <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
              <div className="grid gap-1">
                <Label>OTP</Label>
                <Input
                  placeholder="123456"
                  maxLength={6}
                  {...register("otp")}
                />
              </div>
              {/* <Button onClick={onGetUsername} loading={loading}>{otpSent ? "Resend OTP" : "Send OTP"}</Button> */}
            </div>
          )}

          <Button
            onClick={onGetUsername}
            type="submit"
            loading={loading}
            className="w-full"
          >
            {otpSent ? "Resend OTP" : "Send OTP"}
          </Button>
        </form>

        <Link
          href="/auth/login"
          className="mt-4 h-10 grid place-items-center rounded-md border border-slate-200"
        >
          Back to Login
        </Link>
      </div>
    </main>
  );
}
