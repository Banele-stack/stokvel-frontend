/**
 * Fetch client for the Stokvela NestJS + TypeORM backend (stokvela-api,
 * default http://localhost:5011). `cache()` dedupes repeated calls within a
 * single server render pass; `cache: "no-store"` keeps every request
 * talking to the live database instead of Next's default fetch cache.
 */
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSessionToken } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5011";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: string
  ) {
    super(message);
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getSessionToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError(0, `Could not reach the Stokvela API at ${API_URL}. Is stokvela-api running?`);
  }
  if (res.status === 401) {
    redirect("/login");
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, `${init?.method ?? "GET"} ${path} failed (${res.status}): ${body}`, body);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function apiErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof ApiError)) return fallback;
  try {
    const message = JSON.parse(err.body || "{}").message;
    return Array.isArray(message) ? message.join(" ") : (message ?? fallback);
  } catch {
    return fallback;
  }
}

export function apiErrorStatus(err: unknown, fallback = 502): number {
  return err instanceof ApiError && err.status ? err.status : fallback;
}

async function apiFetchOrUndefined<T>(path: string): Promise<T | undefined> {
  try {
    return await apiFetch<T>(path);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return undefined;
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Groups
// ---------------------------------------------------------------------------

export interface Member {
  id: string;
  name: string;
  phone: string | null;
  payoutPosition: number | null;
  joinedDate: string;
  active: boolean;
  paidThisCycle: boolean;
  totalContributed: number;
}

export interface GroupDetail {
  id: string;
  name: string;
  type: "stokvel" | "burial";
  description: string;
  contributionAmount: number;
  frequency: "Monthly" | "Weekly";
  payoutAmount: number | null;
  balance: number;
  currentCycle: string;
  nextPayoutMemberId: string | null;
  members: Member[];
}

export interface GroupSummary {
  id: string;
  name: string;
  type: "stokvel" | "burial";
  description: string;
  contributionAmount: number;
  frequency: "Monthly" | "Weekly";
  payoutAmount: number | null;
  balance: number;
  currentCycle: string;
  memberCount: number;
  paidCount: number;
  nextPayoutMemberId: string | null;
}

export const getGroups = cache((): Promise<GroupSummary[]> => apiFetch("/groups"));

export const getGroupById = cache(
  (id: string): Promise<GroupDetail | undefined> => apiFetchOrUndefined(`/groups/${id}`)
);

export interface CreateGroupInput {
  name: string;
  type: "stokvel" | "burial";
  description: string;
  contributionAmount: number;
  frequency: "Monthly" | "Weekly";
  payoutAmount?: number;
}

export function createGroup(input: CreateGroupInput): Promise<GroupDetail> {
  return apiFetch("/groups", { method: "POST", body: JSON.stringify(input) });
}

export interface CreateMemberInput {
  name: string;
  phone?: string;
  joinedDate?: string;
}

export function addMember(groupId: string, input: CreateMemberInput): Promise<Member> {
  return apiFetch(`/groups/${groupId}/members`, { method: "POST", body: JSON.stringify(input) });
}

export function markPaid(groupId: string, memberId: string): Promise<unknown> {
  return apiFetch(`/groups/${groupId}/members/${memberId}/pay`, { method: "POST", body: JSON.stringify({}) });
}

export function markUnpaid(groupId: string, memberId: string): Promise<unknown> {
  return apiFetch(`/groups/${groupId}/members/${memberId}/unpay`, { method: "POST", body: JSON.stringify({}) });
}

export interface RecordPayoutInput {
  memberId: string;
  amount: number;
  date?: string;
  note?: string;
}

export function recordPayout(groupId: string, input: RecordPayoutInput): Promise<unknown> {
  return apiFetch(`/groups/${groupId}/payouts`, { method: "POST", body: JSON.stringify(input) });
}
