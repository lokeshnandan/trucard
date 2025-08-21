"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, ErrorText, Input, Label } from "@/app/components/ui";
import { useState } from "react";
import Stepper from "@/app/components/ui/Stepper";
import { registerAccount } from "@/lib/api";

// z.literal(true) with a custom message while preserving strict typing
const termsLiteral = z.literal(true);
const schema = z.object({
  name: z.string().min(2, "Enter your name"),
  address: z.string().min(5, "Enter address"),
  city: z.string().min(2, "Enter city"),
  pincode: z.string().regex(/^[0-9]{6}$/, "Enter 6-digit PIN"),
  terms: termsLiteral.refine((v) => v === true, {
    message: "Accept terms to continue",
  }),
});

type Values = z.infer<typeof schema>;

export default function RegisterStep3() {
  // read prefills from localStorage (client component so safe)
  const panName =
    typeof window !== "undefined"
      ? localStorage.getItem("pan_registered_name") ?? ""
      : "";
  const panAddress =
    typeof window !== "undefined"
      ? localStorage.getItem("pan_address") ?? ""
      : "";

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: panName,
      address: panAddress,
      city: "Bangalore",
      pincode: "581115",
    },
  });

  // watch terms checkbox to enable/disable submit button
  const termsAccepted = watch("terms");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setLoading(true);
    try {
      const res = await registerAccount(!!termsAccepted);
      if (res.success) {
        window.location.href = "/auth/success";
      } else {
        alert(res.error || "Registration failed");
      }
    } catch {
      alert("An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  }

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
        <Stepper step={3} />
        <h1 className="text-xl font-semibold">Profile & Terms</h1>

        <p className="text-sm text-slate-600">
          Step 3 of 3 - Review and accept
        </p>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-1">
          <Label>Full Name</Label>
          <Input {...register("name")} readOnly />
          <ErrorText>{errors.name?.message}</ErrorText>
        </div>
        <div className="grid gap-1">
          <Label>Address</Label>
          <Input {...register("address")} readOnly />
          <ErrorText>{errors.address?.message}</ErrorText>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1">
            <Label>City</Label>
            <Input {...register("city")} readOnly />
            <ErrorText>{errors.city?.message}</ErrorText>
          </div>
          <div className="grid gap-1">
            <Label>PIN Code</Label>
            <Input maxLength={6} {...register("pincode")} readOnly />
            <ErrorText>{errors.pincode?.message}</ErrorText>
          </div>
        </div>

        <label className="mt-1 inline-flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" {...register("terms")} /> I agree to the Terms &
          Conditions and Privacy Policy
        </label>
        <ErrorText>{errors.terms?.message}</ErrorText>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/auth/register/step-2"
            className="h-11 rounded-md border border-slate-200 grid place-items-center"
          >
            Back
          </Link>
          <Button type="submit" loading={loading} disabled={!termsAccepted} aria-disabled={!termsAccepted}>
            Create Account
          </Button>
        </div>
      </form>
    </div>
  );
}
