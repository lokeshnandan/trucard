"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, ErrorText, Input, Label } from "@/app/components/ui";
import { resetPassword, verifyResetPassword } from "@/lib/api";

const schema = z.object({
  otp: z.string().min(1, "Enter OTP"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { otp: "", password: "" },
  });

  const [loadingReset, setLoadingReset] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // call resetPassword automatically when user lands on page
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingReset(true);
      try {
        const res = await resetPassword();
        if (!res.success) {
          alert(res.error || "Failed to initiate password reset.");
        }
      } catch {
        alert("Error initiating password reset.");
      } finally {
        if (mounted) setLoadingReset(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function onSubmit(values: FormValues) {
    setVerifying(true);
    try {
      const res = await verifyResetPassword(values.otp.trim(), values.password);
      if (res.success) {
        // success toast already raised by api helper; redirect to login
        router.push("/auth/login");
      } else {
        alert(res.error || "Password reset verification failed.");
      }
    } catch {
      alert("An error occurred while verifying reset OTP.");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="screen-center">
      <div className="w-full max-w-md bg-[var(--tc-card)] rounded-[var(--radius-md)] shadow-sm ring-1 ring-slate-200/70 p-6">
        <div className="flex flex-col items-center gap-4">
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
            Reset Password
          </span>

          <h1 className="text-xl font-semibold">Reset your password</h1>
          <p className="text-sm text-slate-600 pb-5">
            Enter the OTP sent and choose a new password
          </p>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-1">
            <Label>Enter OTP</Label>
            <Input placeholder="Enter OTP" {...register("otp")} />
            <ErrorText>{errors.otp?.message}</ErrorText>
          </div>

          <div className="grid gap-1">
            <Label>Choose your password</Label>
            <Input
              type="password"
              placeholder="New password"
              {...register("password")}
            />
            <ErrorText>{errors.password?.message}</ErrorText>
          </div>

          <div className="flex items-center justify-center w-full">
            {/* <Button
            type="button"
            onClick={() => router.back()}
            className="h-11"
            disabled={loadingReset || verifying}
          >
            Back
          </Button> */}

            <Button
              type="submit"
              loading={verifying}
              disabled={!isValid || verifying || loadingReset}
            >
              Verify & Reset
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
