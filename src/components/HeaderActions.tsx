"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CurrentUser } from "@/lib/session";

export default function HeaderActions({ user }: { user?: CurrentUser }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  if (!user) {
    return (
      <Link href="/login" className="text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-[var(--foreground-muted)] sm:inline">{user.name}</span>
      <button
        type="button"
        onClick={handleLogout}
        className="text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
      >
        Log out
      </button>
    </div>
  );
}
