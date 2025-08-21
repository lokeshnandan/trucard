import LoginPage from "./auth/login/page";

export default function Home() {
  return (
    <main className="">
      {/* <div className="w-full max-w-md bg-[var(--tc-card)] rounded-[var(--radius-md)] shadow-sm ring-1 ring-slate-200/70 p-6">
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="h-12 w-12 rounded-2xl bg-[var(--tc-primary)]/10 grid place-items-center">
            <div className="h-6 w-6 rounded-xl bg-[var(--tc-primary)]" />
          </div>
          <h1 className="text-xl font-semibold">Welcome to TruCard</h1>
          <p className="text-sm text-slate-600 text-center">Retailer Portal</p>
        </div>
        <div className="grid gap-3">
          <a href="/auth/login" className="h-11 rounded-md bg-[var(--tc-primary)] text-white grid place-items-center">Go to Login</a>
          <a href="/auth/register" className="h-11 rounded-md border border-slate-200 grid place-items-center">Create Account</a>
        </div>
      </div> */}
      <LoginPage/>
    </main>
  );
}
