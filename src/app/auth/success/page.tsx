"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function RegistrationSuccessPage() {
	const searchParams = useSearchParams();
	const [username, setUsername] = useState<string | null>(null);

	useEffect(() => {
		const username = searchParams.get("username");
		setUsername(username);
	}, [searchParams]);

	return (
		<main className="screen-center">
			<div className="w-full max-w-md bg-[var(--tc-card)] rounded-[var(--radius-md)] shadow-sm ring-1 ring-slate-200/70 p-6 text-center">
				<div className="mx-auto h-12 w-12 rounded-2xl bg-[var(--tc-primary)]/10 grid place-items-center mb-3">
					<div className="h-6 w-6 rounded-xl bg-[var(--tc-primary)]" />
				</div>
				<div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 grid place-items-center text-emerald-700 text-xl font-bold">✓</div>
				<h1 className="mt-4 text-xl font-semibold">Welcome {username} to TruCard!</h1>
				<p className="text-sm text-slate-600">Account successfully created</p>
				<div className="mt-6 grid gap-3">
					<Link href="/dashboard" className="h-11 rounded-md bg-[var(--tc-primary)] text-white grid place-items-center">Continue to Dashboard</Link>
					<Link href="/auth/resetPassword" className="h-11 rounded-md border border-slate-200 grid place-items-center">Create Password</Link>
				</div>
			</div>
		</main>
	);
}


