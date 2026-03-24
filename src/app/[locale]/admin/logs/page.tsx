"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAdminAuditLog } from "@/context/admin-audit-context";
import { useAdminRbac } from "@/context/admin-rbac-context";
import { RequireAdminAccess } from "@/components/admin/require-admin-access";
import { ADMIN_AUDIT_ACTIONS } from "@/lib/admin-audit-log";

function formatDate(iso: string, loc: string) {
  try {
    return new Intl.DateTimeFormat(loc === "ar" ? "ar-MA" : "fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function AdminLogsPage() {
  return (
    <RequireAdminAccess permission="audit.view">
      <AdminLogsContent />
    </RequireAdminAccess>
  );
}

function AdminLogsContent() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const { logs, hydrated } = useAdminAuditLog();
  const { users } = useAdminRbac();

  const [filterUserId, setFilterUserId] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("all");

  const userLabel = useMemo(() => {
    const m = new Map<string, string>();
    for (const u of users) {
      m.set(u.id, `${u.name} (${u.email})`);
    }
    return m;
  }, [users]);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (filterUserId !== "all" && l.userId !== filterUserId) return false;
      if (filterAction !== "all" && l.action !== filterAction) return false;
      return true;
    });
  }, [logs, filterUserId, filterAction]);

  if (!hydrated) {
    return <div className="h-64 animate-pulse rounded-2xl bg-zinc-200" />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink">{t("logsPageTitle")}</h1>
        <p className="mt-2 text-sm text-stone">{t("logsPageSubtitle")}</p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-[min(100%,220px)] flex-1">
          <label
            htmlFor="logs-filter-user"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone"
          >
            {t("logsFilterUser")}
          </label>
          <select
            id="logs-filter-user"
            value={filterUserId}
            onChange={(e) => setFilterUserId(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            <option value="all">{t("logsFilterAllUsers")}</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} — {u.email}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[min(100%,220px)] sm:max-w-[280px]">
          <label
            htmlFor="logs-filter-action"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone"
          >
            {t("logsFilterAction")}
          </label>
          <select
            id="logs-filter-action"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            <option value="all">{t("logsFilterAllActions")}</option>
            {ADMIN_AUDIT_ACTIONS.map((a) => (
              <option key={a} value={a}>
                {t(`logsAction_${a}` as "logsAction_ADD_PRODUCT")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-stone">
              <tr>
                <th className="px-4 py-3">{t("logsColUser")}</th>
                <th className="px-4 py-3">{t("logsColAction")}</th>
                <th className="px-4 py-3">{t("logsColEntity")}</th>
                <th className="px-4 py-3">{t("logsColDate")}</th>
                <th className="px-4 py-3">{t("logsColDetails")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm text-stone"
                  >
                    {t("logsEmpty")}
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} className="text-ink">
                    <td className="max-w-[200px] px-4 py-3 text-xs">
                      <span className="line-clamp-2 font-medium">
                        {userLabel.get(l.userId) ?? l.userId}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-ink">
                        {t(`logsAction_${l.action}` as "logsAction_ADD_PRODUCT")}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-stone">
                      {l.entity}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-stone">
                      {formatDate(l.date, locale)}
                    </td>
                    <td className="max-w-md px-4 py-3 text-xs text-stone">
                      <span className="line-clamp-3 font-mono">{l.details}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
