import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TruCard Portal",
  description: "Authentication and Registration UI for TruCard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--tc-background)]`}
      >
        <div className="min-h-svh">
          <header className="w-full border-b border-slate-200/60 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
              <Link href="/" className="font-semibold text-slate-800">
                TruCard
              </Link>
              <nav className="text-sm text-slate-600 gap-4 hidden sm:flex">
                <Link href="/auth/login" className="hover:text-slate-900">
                  Login
                </Link>
                <Link href="/auth/register" className="hover:text-slate-900">
                  Create Account
                </Link>
              </nav>
            </div>
          </header>
          <Toaster position="top-center" richColors />

          {children}
        </div>
      </body>
    </html>
  );
}
