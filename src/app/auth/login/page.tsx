"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { login } from "@/lib/api"; // Add this import
import { toast } from "sonner";

const loginSchema = z.object({
  username: z
    .string()
    .min(6, "Enter your username")
    .regex(/^[A-Za-z0-9_-]+$/, "Invalid username"),
  password: z.string().min(6, "Enter your password"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Add error state
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    setLoading(true);
    setError(null);
    const result = await login(values);
    console.log("Login result:", result.data);
    setLoading(false);

    // if backend requests password reset (status 1001), persist user_id and redirect
    if ((result.data as any)?.status === 1001) {
      const userId = (result.data as any)?.user_id;
      if (userId) {
        try {
          localStorage.setItem("user_id", String(userId));
        } catch {}
      }
      window.location.href = "/auth/resetPassword";
      return;
    }

    if (result.success) {
      // Redirect or show success
      // window.location.href = "/dashboard"; 
      toast.success("Login successful!");
    } else {
      setError(result.error || "Login failed");
    }
  }

  return (
    <main className="screen-center">
      <div className="w-full max-w-md bg-[var(--tc-card)] rounded-[var(--radius-md)] shadow-sm ring-1 ring-slate-200/70 p-6 pb-20">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-[var(--tc-primary)]/10 grid place-items-center">
            <div className="h-6 w-6 rounded-xl bg-[var(--tc-primary)]" />
          </div>
          <span className="text-xl font-bold text-primary">TruCard</span>
          <p className="text-sm text-slate-500">Retailer Portal</p>
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
            Retail Login
          </p>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-1">
            <label className="text-sm font-semibold text-slate-700">Username</label>
            <input
              className="h-11 rounded-md border border-slate-300 px-3 focus-ring"
              placeholder="RA176900435"
              {...register("username")}
            />
            {errors.username && (
              <p className="text-xs text-red-600">{errors.username.message}</p>
            )}
            <div
              style={{
                fontWeight: 500,
              }}
            >
              <Link
                href="/auth/recover/username"
                className="text-xs text-[var(--tc-primary)]"
              >
                Forgot Username?
              </Link>
            </div>
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <input
              type="password"
              className="h-11 rounded-md border border-slate-300 px-3 focus-ring"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password.message}</p>
            )}
            <div
              style={{
                fontWeight: 500,
              }}
            >
              <Link
                href="/auth/recover/password"
                className="text-xs text-[var(--tc-primary)]"
              >
                Forgot Password?
              </Link>
            </div>
          </div>
          {error && <p className="text-xs text-red-600 text-center">{error}</p>}
          <button
            disabled={loading}
            className="h-11 rounded-md bg-[var(--tc-primary)] text-white disabled:opacity-60 grid place-items-center cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div
          style={{
            borderBottom: "1px solid #eaeaea",
            margin: "1rem 0",
            padding: "0.5rem 0",
          }}
        ></div>

        <div className="mt-6 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/register/step-1"
            className="text-[var(--tc-primary)]"
          >
            Create Account
          </Link>
        </div>
      </div>
    </main>
  );
}
