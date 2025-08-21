import Link from "next/link";
import RegisterStep1 from "./step-1/page";

export default function RegisterIndex() {
  return (
    <div className="">
      {/* <div className="flex flex-col items-center gap-2">
				<div className="h-12 w-12 rounded-2xl bg-[var(--tc-primary)]/10 grid place-items-center">
					<div className="h-6 w-6 rounded-xl bg-[var(--tc-primary)]" />
				</div>
				<span className="text-sm text-slate-600">Registration</span>
				<h1 className="text-xl font-semibold">Create Account</h1>
			</div>
			<div className="grid grid-cols-3 items-center gap-2 w-max mx-auto">
				<span className="h-2 w-2 rounded-full bg-[var(--tc-primary)]" />
				<span className="h-2 w-2 rounded-full bg-slate-300" />
				<span className="h-2 w-2 rounded-full bg-slate-300" />
			</div>
			<div className="grid gap-2 text-center text-slate-600">
				<p>Step 1 of 3 • Verify contact details</p>
			</div>
			<div className="grid gap-3">
				<Link href="/auth/register/step-1" className="h-11 rounded-md bg-[var(--tc-primary)] text-white grid place-items-center">Start Registration</Link>
				<Link href="/auth/login" className="h-11 rounded-md border border-slate-200 grid place-items-center">Back to Login</Link>
			</div> */}

      <RegisterStep1 />
    </div>
  );
}
