"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useAdminAuditLog } from "@/context/admin-audit-context";
import { useAdminRbac } from "@/context/admin-rbac-context";
import { RequireAdminAccess } from "@/components/admin/require-admin-access";
import { LogActionBadge } from "@/components/admin/log-action-badge";
import type { AdminAuditAction } from "@/lib/admin-audit-log";

const USER_LOG_FILTER_ACTIONS: AdminAuditAction[] = [
  "ADD_PRODUCT",
  "DELETE_PRODUCT",
  "UPDATE_PRODUCT",
  "CONFIRM_ORDER",
];

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

export default function AdminUserLogsPage() {
  return (
    <RequireAdminAccess
      permission="audit.view"
      deniedBodyKey="accessDeniedLogs"
    >
      <AdminUserLogsContent />
    </RequireAdminAccess>
  );
}

function AdminUserLogsContent() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const params = useParams();
  const userId = String(params.id ?? "");

  const { logs, hydrated } = useAdminAuditLog();
  const { users } = useAdminRbac();

  const [filterAction, setFilterAction] = useState<string>("all");

  const targetUser = useMemo(
    () => users.find((u) => u.id === userId) ?? null,
    [users, userId]
  );

  const filteredSorted = useMemo(() => {
    const list = logs.filter((l) => {
      if (l.userId !== userId) return false;
      if (filterAction !== "all" && l.action !== filterAction) return false;
      return true;
    });
    return [...list].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [logs, userId, filterAction]);

  if (!hydrated) {
    return <div className="h-64 animate-pulse rounded-2xl bg-zinc-200" />;
  }

  if (!targetUser) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-zinc-200 bg-white px-8 py-12 text-center shadow-sm">
        <p className="font-display text-lg text-ink">{t("userLogsNotFound")}</p>
        <Link
          href="/admin/users"
          className="mt-6 inline-block text-sm font-semibold text-accent underline-offset-4 hover:underline"
        >
          {t("userLogsBack")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <Link
            href="/admin/users"
            className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            {t("userLogsBack")}
          </Link>
          <h1 className="mt-4 font-display text-3xl text-ink">
            {t("userLogsTitle", {
              name: targetUser.name || targetUser.email,
            })}
          </h1>
          <p className="mt-2 text-sm text-stone">{targetUser.email}</p>
        </div>

        <div className="min-w-[min(100%,240px)] sm:max-w-[300px]">
          <label
            htmlFor="user-logs-filter-action"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone"
          >
            {t("userLogsFilterAction")}
          </label>
          <select
            id="user-logs-filter-action"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            <option value="all">{t("logsFilterAllActions")}</option>
            {USER_LOG_FILTER_ACTIONS.map((a) => (
              <option key={a} value={a}>
                {t(`logsAction_${a}` as "logsAction_ADD_PRODUCT")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-stone">
              <tr>
                <th className="px-4 py-3">{t("logsColAction")}</th>
                <th className="px-4 py-3">{t("logsColEntity")}</th>
                <th className="px-4 py-3">{t("logsColDate")}</th>
                <th className="px-4 py-3">{t("logsColDetails")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredSorted.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-sm text-stone"
                  >
                    {t("userLogsEmpty")}
                  </td>
                </tr>
              ) : (
                filteredSorted.map((l) => (
                  <tr
                    key={l.id}
                    className={
                      l.action.includes("DELETE")
                        ? "bg-red-50/40 text-ink"
                        : "text-ink"
                    }
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      <LogActionBadge
                        action={l.action}
                        label={t(
                          `logsAction_${l.action}` as "logsAction_ADD_PRODUCT"
                        )}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-stone">
                      {l.entity}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-stone">
                      {formatDate(l.date, locale)}
                    </td>
                    <td className="max-w-lg px-4 py-3 text-xs text-stone">
                      <span className="font-mono leading-relaxed">{l.details}</span>
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
