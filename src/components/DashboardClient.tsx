"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  ArrowRight,
  HandCoins,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";
import type { GroupSummary } from "@/lib/api";
import { formatZar } from "@/lib/utils";

export default function DashboardClient({ groups }: { groups: GroupSummary[] }) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">My Groups</h1>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">
            Every member sees the same ledger — contributions, balance, and who&apos;s next in line.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[var(--accent)] px-3.5 py-2 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]"
        >
          <Plus size={15} />
          New Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-6 py-14 text-center">
          <p className="text-sm font-medium text-[var(--foreground)]">No groups yet</p>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">
            Create your first stokvel or burial society to start the ledger.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => {
            const unpaidCount = group.memberCount - group.paidCount;
            const Icon = group.type === "burial" ? HeartHandshake : HandCoins;
            return (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition-colors hover:border-[var(--border-strong)]"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Icon size={20} />
                  </span>
                  <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-[var(--foreground-muted)]">
                    {group.type === "burial" ? "Burial Society" : "Stokvel"}
                  </span>
                </div>

                <h2 className="mt-4 text-base font-semibold text-[var(--foreground)]">{group.name}</h2>
                <p className="mt-1 text-xs text-[var(--foreground-muted)] line-clamp-2">{group.description}</p>

                <div className="mt-4 flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
                  <Users size={13} />
                  {group.memberCount} members &middot; {formatZar(group.contributionAmount)}/{group.frequency.toLowerCase()}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-[var(--foreground-muted)]">Group balance</p>
                    <p className="text-lg font-semibold tabular-nums text-[var(--foreground)]">{formatZar(group.balance)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    {unpaidCount > 0 ? (
                      <span className="flex items-center gap-1 text-[var(--status-warning-text)]">
                        <AlertCircle size={13} />
                        {unpaidCount} unpaid
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[var(--status-good-text)]">
                        <CheckCircle2 size={13} />
                        All paid up
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[var(--accent)] group-hover:gap-2 transition-all">
                  View ledger
                  <ArrowRight size={13} />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {createOpen && (
        <CreateGroupModal
          onClose={() => setCreateOpen(false)}
          onCreated={(id) => {
            setCreateOpen(false);
            router.push(`/groups/${id}`);
          }}
        />
      )}
    </div>
  );
}

function CreateGroupModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"stokvel" | "burial">("stokvel");
  const [description, setDescription] = useState("");
  const [contributionAmount, setContributionAmount] = useState("500");
  const [frequency, setFrequency] = useState<"Monthly" | "Weekly">("Monthly");
  const [payoutAmount, setPayoutAmount] = useState("15000");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          description,
          contributionAmount: Number(contributionAmount),
          frequency,
          ...(type === "burial" ? { payoutAmount: Number(payoutAmount) } : {}),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = Array.isArray(body.message) ? body.message.join(" ") : body.message;
        throw new Error(message ?? "Failed to create group.");
      }
      onCreated(body.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create group.");
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-8"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <p className="text-sm font-semibold text-[var(--foreground)]">New Group</p>
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

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType("stokvel")}
              className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                type === "stokvel"
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--foreground-muted)]"
              }`}
            >
              Stokvel
            </button>
            <button
              type="button"
              onClick={() => setType("burial")}
              className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                type === "burial"
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--foreground-muted)]"
              }`}
            >
              Burial Society
            </button>
          </div>

          <Field label="Group name">
            <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Description">
            <textarea required rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={`${type === "burial" ? "Monthly" : "Contribution"} amount (R)`}>
              <input
                type="number"
                min={1}
                required
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Frequency">
              <select value={frequency} onChange={(e) => setFrequency(e.target.value as "Monthly" | "Weekly")} className={inputClass}>
                <option value="Monthly">Monthly</option>
                <option value="Weekly">Weekly</option>
              </select>
            </Field>
          </div>

          {type === "burial" && (
            <Field label="Claim payout amount (R)">
              <input
                type="number"
                min={1}
                required
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                className={inputClass}
              />
            </Field>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] disabled:opacity-60"
          >
            {submitting ? "Creating…" : "Create group"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-[var(--foreground)]">{label}</label>
      {children}
    </div>
  );
}
