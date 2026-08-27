/**
 * Server-only session helpers. The JWT lives in an httpOnly cookie (set by
 * app/api/auth/login/route.ts) — never readable from client-side JS.
 */
import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "stokvela_session";

export async function getSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5011";

export const getCurrentUser = cache(async (): Promise<CurrentUser | undefined> => {
  const token = await getSessionToken();
  if (!token) return undefined;
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return undefined;
    return (await res.json()) as CurrentUser;
  } catch {
    return undefined;
  }
});
