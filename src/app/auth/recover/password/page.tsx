"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button, ErrorText, Input, Label } from "@/app/components/ui";
import { sendPasswordReset } from "@/lib/api";
import { useState } from "react";
import { User } from "lucide-react";

const schema = z.object({ username: z.string().min(3, "Enter your username") });
type Values = z.infer<typeof schema>;

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });
  const [loading, setLoading] = useState(false);

  async function onSubmit(values: Values) {
    setLoading(true);
    try {
      const response = await sendPasswordReset(values.username);
      if (response.success) {
        // alert(response.data?.message || "Reset link sent to registered email");
      } else {
        alert(`Failed to send reset link: ${response.error}`);
      }
    } catch (error) {

      alert("Reset link sent to registered email (demo mode)");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="screen-center">
      <div className="w-full max-w-md bg-[var(--tc-card)] rounded-[var(--radius-md)] shadow-sm ring-1 ring-slate-200/70 p-6">
        <div className="flex flex-col items-center gap-2 mb-4">
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
            Password Recovery
          </span>
          <h1 className="text-xl font-semibold">Forgot Password?</h1>
          <p className="text-sm text-slate-600">Enter your username</p>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-1">
            <div className="flex items-center gap-3">
              <User size={14} />
              <Label>Username</Label>
            </div>
            <Input
              placeholder="Enter your username"
              {...register("username")}
            />
            <ErrorText>{errors.username?.message}</ErrorText>
          </div>
          <Button type="submit" loading={loading} className="w-full">
            Send Reset Link
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
