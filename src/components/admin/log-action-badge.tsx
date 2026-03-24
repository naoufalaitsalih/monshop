"use client";

import type { AdminAuditAction } from "@/lib/admin-audit-log";

type Props = {
  action: AdminAuditAction;
  label: string;
};

export function LogActionBadge({ action, label }: Props) {
  const isDelete = action.includes("DELETE");
  const isClick = action.startsWith("CLICK_");
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
        isDelete
          ? "bg-red-100 text-red-900 ring-1 ring-red-200"
          : isClick
            ? "bg-amber-100 text-amber-950 ring-1 ring-amber-200/80"
            : "bg-zinc-100 text-ink"
      }`}
    >
      {label}
    </span>
  );
}
