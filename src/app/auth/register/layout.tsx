export default function RegisterLayout({ children }: { children: React.ReactNode }) {
	return (
		<main className="screen-center">
			<div className="w-full max-w-2xl bg-[var(--tc-card)] rounded-[var(--radius-md)] shadow-sm ring-1 ring-slate-200/70 p-6">
				{children}
			</div>
		</main>
	);
}


