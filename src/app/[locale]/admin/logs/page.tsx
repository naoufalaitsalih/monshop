"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAdminAuditLog } from "@/context/admin-audit-context";
import { useAdminRbac } from "@/context/admin-rbac-context";
import { useAdminAuth } from "@/context/admin-auth-context";
import { RequireAdminAccess } from "@/components/admin/require-admin-access";
import { LogActionBadge } from "@/components/admin/log-action-badge";
import { ADMIN_AUDIT_ACTIONS } from "@/lib/admin-audit-log";
import type { AdminAuditAction } from "@/lib/admin-audit-log";
import {
  clickAuditHumanMine,
  clickAuditShortLabel,
} from "@/lib/admin-audit-click-labels";
import type { ClickAuditAction } from "@/lib/admin-audit-log";

const PAGE_SIZE = 15;

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
    <RequireAdminAccess
      permission="audit.view"
      deniedBodyKey="accessDeniedLogs"
    >
      <AdminLogsContent />
    </RequireAdminAccess>
  );
}

type Perspective = "mine" | "team";

function AdminLogsContent() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const { logs, hydrated } = useAdminAuditLog();
  const { users } = useAdminRbac();
  const { user: authUser } = useAdminAuth();

  const [perspective, setPerspective] = useState<Perspective>("mine");
  const [filterUserId, setFilterUserId] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [listPage, setListPage] = useState(1);

  const firstRowRef = useRef<HTMLTableRowElement | null>(null);
  const topIdRef = useRef<string | null>(null);

  const userLabel = useMemo(() => {
    const m = new Map<string, string>();
    for (const u of users) {
      m.set(u.id, `${u.name} (${u.email})`);
    }
    return m;
  }, [users]);

  const effectiveUserId =
    perspective === "mine" && authUser?.id ? authUser.id : filterUserId;

  const filtered = useMemo(() => {
    const list = logs.filter((l) => {
      if (effectiveUserId !== "all" && l.userId !== effectiveUserId) {
        return false;
      }
      if (filterAction !== "all" && l.action !== filterAction) return false;
      return true;
    });
    return [...list].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [logs, effectiveUserId, filterAction]);

  useEffect(() => {
    setListPage(1);
  }, [perspective, effectiveUserId, filterAction, logs.length]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(listPage, totalPages);
  const pageSlice = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  const newestId = filtered[0]?.id ?? null;

  useEffect(() => {
    if (!newestId || newestId === topIdRef.current) return;
    topIdRef.current = newestId;
    requestAnimationFrame(() => {
      firstRowRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  }, [newestId]);

  const actionBadgeLabel = (action: AdminAuditAction) =>
    action.startsWith("CLICK_")
      ? clickAuditShortLabel(action as ClickAuditAction, locale)
      : t(`logsAction_${action}` as "logsAction_ADD_PRODUCT");

  const humanLine = (action: AdminAuditAction) =>
    action.startsWith("CLICK_")
      ? clickAuditHumanMine(action as ClickAuditAction, locale)
      : t(`logsHuman_${action}` as "logsHuman_ADD_PRODUCT");

  const emptyMessage =
    perspective === "mine" ? t("logsEmptyMine") : t("logsEmpty");

  if (!hydrated) {
    return <div className="h-64 animate-pulse rounded-2xl bg-zinc-200" />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink dark:text-zinc-50">
          {perspective === "mine"
            ? t("logsPageTitleMine")
            : t("logsPageTitle")}
        </h1>
        <p className="mt-2 text-sm text-stone dark:text-zinc-400">
          {perspective === "mine"
            ? t("logsPageSubtitleMine")
            : t("logsPageSubtitle")}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div
          className="inline-flex rounded-full border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
          role="tablist"
          aria-label={t("logsPerspectiveLabel")}
        >
          <button
            type="button"
            role="tab"
            aria-selected={perspective === "mine"}
            onClick={() => setPerspective("mine")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              perspective === "mine"
                ? "bg-ink text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-stone hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            {t("logsTabMine")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={perspective === "team"}
            onClick={() => setPerspective("team")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              perspective === "team"
                ? "bg-ink text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-stone hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            {t("logsTabTeam")}
          </button>
        </div>

        {perspective === "mine" ? (
          <p className="text-sm text-stone dark:text-zinc-400">
            {t("logsMineHint")}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 sm:flex-row sm:flex-wrap sm:items-end">
        {perspective === "team" ? (
          <div className="min-w-[min(100%,220px)] flex-1">
            <label
              htmlFor="logs-filter-user"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone dark:text-zinc-500"
            >
              {t("logsFilterUser")}
            </label>
            <select
              id="logs-filter-user"
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="all">{t("logsFilterAllUsers")}</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.email}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div
          className={`min-w-[min(100%,220px)] ${perspective === "team" ? "sm:max-w-[280px]" : "flex-1 sm:max-w-[320px]"}`}
        >
          <label
            htmlFor="logs-filter-action"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone dark:text-zinc-500"
          >
            {t("logsFilterAction")}
          </label>
          <select
            id="logs-filter-action"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          >
            <option value="all">{t("logsFilterAllActions")}</option>
            {ADMIN_AUDIT_ACTIONS.map((a) => (
              <option key={a} value={a}>
                {actionBadgeLabel(a)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          {perspective === "mine" ? (
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-stone dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3">{t("logsColDate")}</th>
                  <th className="px-4 py-3">{t("logsColWhatYouDid")}</th>
                  <th className="px-4 py-3">{t("logsColDetails")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {pageSlice.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-12 text-center text-sm text-stone dark:text-zinc-400"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  pageSlice.map((l, i) => {
                    const isNewest = safePage === 1 && i === 0;
                    return (
                      <tr
                        key={l.id}
                        ref={isNewest ? firstRowRef : undefined}
                        className={`text-ink dark:text-zinc-100 ${
                          l.action.includes("DELETE")
                            ? "bg-red-50/40 dark:bg-red-950/25"
                            : ""
                        } ${
                          isNewest
                            ? "animate-pulse-highlight bg-accent/5 dark:bg-accent/10"
                            : ""
                        }`}
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-stone dark:text-zinc-400">
                          {formatDate(l.date, locale)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="mb-2">
                            <LogActionBadge
                              action={l.action}
                              label={actionBadgeLabel(l.action)}
                            />
                          </div>
                          <p className="font-medium text-ink dark:text-zinc-100">
                            {humanLine(l.action)}
                          </p>
                          <p className="mt-0.5 text-xs text-stone dark:text-zinc-500">
                            {t("logsMineEntity", { entity: l.entity })}
                          </p>
                        </td>
                        <td className="max-w-md px-4 py-3 text-xs text-stone dark:text-zinc-400">
                          <span className="line-clamp-4 font-mono leading-relaxed">
                            {l.details}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-stone dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3">{t("logsColUser")}</th>
                  <th className="px-4 py-3">{t("logsColAction")}</th>
                  <th className="px-4 py-3">{t("logsColEntity")}</th>
                  <th className="px-4 py-3">{t("logsColDate")}</th>
                  <th className="px-4 py-3">{t("logsColDetails")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {pageSlice.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center text-sm text-stone dark:text-zinc-400"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  pageSlice.map((l, i) => {
                    const isNewest = safePage === 1 && i === 0;
                    return (
                      <tr
                        key={l.id}
                        ref={isNewest ? firstRowRef : undefined}
                        className={`text-ink dark:text-zinc-100 ${
                          l.action.includes("DELETE")
                            ? "bg-red-50/40 dark:bg-red-950/25"
                            : ""
                        } ${
                          isNewest
                            ? "animate-pulse-highlight bg-accent/5 dark:bg-accent/10"
                            : ""
                        }`}
                      >
                        <td className="max-w-[200px] px-4 py-3 text-xs">
                          <span className="line-clamp-2 font-medium">
                            {authUser?.id === l.userId ? (
                              <span className="inline-flex flex-col gap-0.5">
                                <span className="w-fit rounded-full bg-accent/25 px-2 py-0.5 text-[10px] font-bold uppercase text-ink dark:text-zinc-900">
                                  {t("logsYouBadge")}
                                </span>
                                <span>
                                  {userLabel.get(l.userId) ?? l.userId}
                                </span>
                              </span>
                            ) : (
                              (userLabel.get(l.userId) ?? l.userId)
                            )}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <LogActionBadge
                            action={l.action}
                            label={actionBadgeLabel(l.action)}
                          />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-stone dark:text-zinc-400">
                          {l.entity}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-stone dark:text-zinc-400">
                          {formatDate(l.date, locale)}
                        </td>
                        <td className="max-w-md px-4 py-3 text-xs text-stone dark:text-zinc-400">
                          <span className="line-clamp-3 font-mono">
                            {l.details}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {filtered.length > PAGE_SIZE ? (
        <div className="flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-700 sm:flex-row">
          <p className="text-center text-sm text-stone dark:text-zinc-400 sm:text-start">
            {t("logsPaginationStatus", {
              page: safePage,
              total: totalPages,
              count: filtered.length,
            })}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setListPage((p) => Math.max(1, p - 1))}
              className="rounded-full border border-zinc-300 bg-white px-5 py-2 text-sm font-semibold text-ink transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              {t("logsPagePrev")}
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setListPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-full border border-zinc-300 bg-white px-5 py-2 text-sm font-semibold text-ink transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              {t("logsPageNext")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
