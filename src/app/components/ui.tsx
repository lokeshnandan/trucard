"use client";

import { Loader2 } from "lucide-react";
import { Button as SButton } from "@/components/ui/button";
import { Input as SInput } from "@/components/ui/input";
import { Label as SLabel } from "@/components/ui/label";
import { Card as SCard } from "@/components/ui/card";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
	return <SCard className={className}>{children}</SCard>;
}

export function Button({ children, className, disabled, loading, type = "button", onClick }: {
	children: React.ReactNode;
	className?: string;
	disabled?: boolean;
	loading?: boolean;
	type?: "button" | "submit" | "reset";
	onClick?: () => void;
}) {
	return (
		<SButton type={type} className={className} disabled={disabled || loading} onClick={onClick}>
			{loading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</span> : children}
		</SButton>
	);
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
	return <SInput className={className} {...props} />;
}

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
	return <SLabel className={className}>{children}</SLabel>;
}

export function ErrorText({ children }: { children?: React.ReactNode }) {
	if (!children) return null;
	return <p className="text-xs text-red-600 mt-1">{children}</p>;
}

// export function Stepper({ step }: { step: 1 | 2 | 3 }) {
// 	return (
// 		<div className="flex items-center gap-2 mx-auto w-max">
// 			{[1, 2, 3].map((s) => (
// 				<span key={s} className={clsx("h-2 w-2 rounded-full", s <= step ? "bg-[var(--tc-primary)]" : "bg-slate-300")} />
// 			))}
// 		</div>
// 	);
// }


