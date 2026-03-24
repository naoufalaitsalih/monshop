"use client";

import { useAdminAuth } from "@/context/admin-auth-context";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useAdminClickLog } from "@/hooks/use-admin-click-log";

export function AdminSessionBar() {
  const t = useTranslations("admin");
  const { ready, user, logout, isAuthenticated } = useAdminAuth();
  const router = useRouter();
  const { logClick } = useAdminClickLog();

  if (!ready || !isAuthenticated() || !user) return null;

  const handleLogout = () => {
    logClick("CLICK_SESSION_LOGOUT", "session", user.email);
    logout();
    router.replace("/admin/login");
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <span
        className="max-w-[220px] truncate rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-ink dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        title={`${user.name} · ${user.email}`}
      >
        <span className="text-stone dark:text-zinc-400">{t("authBadgeLabel")}</span>{" "}
        <span className="text-ink dark:text-zinc-100">{user.name}</span>
      </span>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
      >
        {t("authLogout")}
      </button>
    </div>
  );
}
