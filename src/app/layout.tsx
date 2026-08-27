import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { HandCoins } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import HeaderActions from "@/components/HeaderActions";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stokvela — Stokvel & Burial Society Ledger",
  description: "A shared, transparent ledger for stokvels and burial societies — everyone sees the same numbers.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-[var(--background)] text-[var(--foreground)]">
        <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)]">
                <HandCoins size={18} strokeWidth={2.5} />
              </span>
              <span className="text-[15px] font-semibold tracking-tight text-[var(--foreground)]">
                Stokvel<span className="font-normal text-[var(--foreground-muted)]">a</span>
              </span>
            </Link>
            <HeaderActions user={user} />
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-6">
          <p className="mx-auto max-w-6xl px-4 text-center text-xs text-[var(--foreground-muted)] sm:px-6">
            Stokvela &mdash; a shared, transparent ledger for stokvels and burial societies.
          </p>
        </footer>
      </body>
    </html>
  );
}
