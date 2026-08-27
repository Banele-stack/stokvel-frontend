"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { HandCoins, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.message ?? "Sign in failed. Check your email and password.");
        setSubmitting(false);
        return;
      }
      const next = searchParams.get("next") ?? "/";
      router.push(next);
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)]">
          <HandCoins size={24} strokeWidth={2.5} />
        </span>
        <h1 className="mt-4 text-xl font-semibold tracking-tight text-[var(--foreground)]">
          Sign in to Stokvela
        </h1>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">Your groups, one shared ledger</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
              Email
            </label>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-9 pr-3 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-9 pr-9 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--foreground-muted)]">
        New here?{" "}
        <Link href="/register" className="font-medium text-[var(--accent)] hover:underline">
          Create an account
        </Link>
      </p>

      <p className="mt-6 text-center text-xs text-[var(--foreground-muted)]">
        Demo login: demo@stokvela.co.za / Stokvela2026!
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
