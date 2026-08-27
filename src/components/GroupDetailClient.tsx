"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Wallet,
  Crown,
  CheckCircle2,
  XCircle,
  HandCoins,
  HeartHandshake,
  Plus,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { GroupDetail } from "@/lib/api";
import { formatZar, formatDate } from "@/lib/utils";

export default function GroupDetailClient({ group }: { group: GroupDetail }) {
  const router = useRouter();
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [busyMemberId, setBusyMemberId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const Icon = group.type === "burial" ? HeartHandshake : HandCoins;
  const sortedMembers =
    group.type === "stokvel"
      ? [...group.members].sort((a, b) => (a.payoutPosition ?? 0) - (b.payoutPosition ?? 0))
      : group.members;

  async function togglePaid(memberId: string, paidThisCycle: boolean) {
    setBusyMemberId(memberId);
    setError(null);
    try {
      const res = await fetch(`/api/groups/${group.id}/members/${memberId}/${paidThisCycle ? "unpay" : "pay"}`, {
        method: "POST",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.message ?? "Failed to update contribution.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update contribution.");
    } finally {
      setBusyMemberId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
      >
        <ArrowLeft size={15} />
        Back to my groups
      </Link>

      <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Icon size={26} />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl">
              {group.name}
            </h1>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">{group.description}</p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
              <Users size={13} />
              {group.members.length} members &middot; {formatZar(group.contributionAmount)}/
              {group.frequency.toLowerCase()} contribution &middot; cycle {group.currentCycle}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--foreground-muted)]">
            <Wallet size={13} /> Group Balance
          </p>
          <p className="mt-1.5 text-lg font-semibold tabular-nums text-[var(--foreground)]">
            {formatZar(group.balance)}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs font-medium text-[var(--foreground-muted)]">Paid This Cycle</p>
          <p className="mt-1.5 text-lg font-semibold tabular-nums text-[var(--foreground)]">
            {group.members.filter((m) => m.paidThisCycle).length}/{group.members.length}
          </p>
        </div>
        {group.type === "stokvel" ? (
          <div className="col-span-2 flex items-center justify-between rounded-xl border border-[var(--gold)] bg-[var(--gold-soft)] p-4 sm:col-span-2">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--gold)" }}>
                <Crown size={13} /> Next Payout Goes To
              </p>
              <p className="mt-1.5 text-lg font-semibold text-[var(--foreground)]">
                {group.members.find((m) => m.id === group.nextPayoutMemberId)?.name ?? "—"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPayoutOpen(true)}
              className="rounded-md bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]"
            >
              Pay out
            </button>
          </div>
        ) : (
          <div className="col-span-2 flex items-center justify-between rounded-xl border border-[var(--gold)] bg-[var(--gold-soft)] p-4 sm:col-span-2">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--gold)" }}>
                <HeartHandshake size={13} /> Payout on Claim
              </p>
              <p className="mt-1.5 text-lg font-semibold text-[var(--foreground)]">
                {formatZar(group.payoutAmount ?? 0)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPayoutOpen(true)}
              className="rounded-md bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]"
            >
              Record claim
            </button>
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            {group.type === "stokvel" ? "Members & Payout Order" : "Members & Paid-Up Status"}
          </h2>
          <button
            type="button"
            onClick={() => setAddMemberOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
          >
            <Plus size={13} />
            Add member
          </button>
        </div>
        <div className="scroll-x rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full min-w-[620px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--foreground-muted)]">
                <th className="px-4 py-3 font-medium">Member</th>
                {group.type === "stokvel" && <th className="px-4 py-3 font-medium">Order</th>}
                <th className="px-4 py-3 font-medium">This Cycle</th>
                <th className="px-4 py-3 font-medium">Total Contributed</th>
                <th className="px-4 py-3 font-medium">Member Since</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {sortedMembers.map((member) => {
                const isNext = member.id === group.nextPayoutMemberId;
                const busy = busyMemberId === member.id;
                return (
                  <tr
                    key={member.id}
                    className={`border-b border-[var(--border)] last:border-0 ${
                      isNext ? "bg-[var(--gold-soft)]" : "hover:bg-[var(--surface-muted)]"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[var(--foreground)]">{member.name}</span>
                        {isNext && (
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{ background: "var(--gold)", color: "#1a0f06" }}
                          >
                            <Crown size={10} />
                            NEXT
                          </span>
                        )}
                      </div>
                    </td>
                    {group.type === "stokvel" && (
                      <td className="px-4 py-3 text-[var(--foreground-muted)]">#{member.payoutPosition}</td>
                    )}
                    <td className="px-4 py-3">
                      {member.paidThisCycle ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--status-good-border)] bg-[var(--status-good-bg)] px-2 py-0.5 text-xs font-medium text-[var(--status-good-text)]">
                          <CheckCircle2 size={12} /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--status-critical-border)] bg-[var(--status-critical-bg)] px-2 py-0.5 text-xs font-medium text-[var(--status-critical-text)]">
                          <XCircle size={12} /> Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-[var(--foreground)]">
                      {formatZar(member.totalContributed)}
                    </td>
                    <td className="px-4 py-3 text-[var(--foreground-muted)]">{formatDate(member.joinedDate)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => togglePaid(member.id, member.paidThisCycle)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-muted)] disabled:opacity-60"
                      >
                        {busy && <Loader2 size={12} className="animate-spin" />}
                        {member.paidThisCycle ? "Undo" : "Mark paid"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {addMemberOpen && (
        <AddMemberModal
          groupId={group.id}
          onClose={() => setAddMemberOpen(false)}
          onAdded={() => {
            setAddMemberOpen(false);
            router.refresh();
          }}
        />
      )}

      {payoutOpen && (
        <RecordPayoutModal
          group={group}
          onClose={() => setPayoutOpen(false)}
          onRecorded={() => {
            setPayoutOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function AddMemberModal({
  groupId,
  onClose,
  onAdded,
}: {
  groupId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone: phone || undefined }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.message ?? "Failed to add member.");
      }
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add member.");
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <p className="text-sm font-semibold text-[var(--foreground)]">Add Member</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          {error && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--foreground)]">Name</label>
            <input
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--foreground)]">Phone (optional)</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] disabled:opacity-60"
          >
            {submitting ? "Adding…" : "Add member"}
          </button>
        </div>
      </form>
    </div>
  );
}

function RecordPayoutModal({
  group,
  onClose,
  onRecorded,
}: {
  group: GroupDetail;
  onClose: () => void;
  onRecorded: () => void;
}) {
  const defaultMemberId = group.type === "stokvel" ? group.nextPayoutMemberId ?? "" : "";
  const [memberId, setMemberId] = useState(defaultMemberId);
  const [amount, setAmount] = useState(
    String(group.type === "stokvel" ? group.contributionAmount * group.members.length : group.payoutAmount ?? 0)
  );
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!memberId) {
      setError("Choose who the payout is for.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/groups/${group.id}/payouts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, amount: Number(amount), note: note || undefined }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.message ?? "Failed to record payout.");
      }
      onRecorded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record payout.");
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            {group.type === "stokvel" ? "Pay Out the Pot" : "Record a Claim Payout"}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          {error && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--foreground)]">Member</label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            >
              <option value="">Select a member…</option>
              {group.members
                .filter((m) => m.active)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                    {m.id === group.nextPayoutMemberId ? " (next up)" : ""}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--foreground)]">Amount (R)</label>
            <input
              type="number"
              min={1}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--foreground)]">Note (optional)</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={group.type === "burial" ? "e.g. Funeral claim for..." : undefined}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] disabled:opacity-60"
          >
            {submitting ? "Recording…" : "Record payout"}
          </button>
        </div>
      </form>
    </div>
  );
}
