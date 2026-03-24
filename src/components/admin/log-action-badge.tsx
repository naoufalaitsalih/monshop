"use client";

import type { AdminAuditAction } from "@/lib/admin-audit-log";

type Props = {
  action: AdminAuditAction;
  label: string;
};

export function LogActionBadge({ action, label }: Props) {
  const isDelete = action.includes("DELETE");
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
        isDelete
          ? "bg-red-100 text-red-900 ring-1 ring-red-200"
          : "bg-zinc-100 text-ink"
      }`}
    >
      {label}
    </span>
  );
}
