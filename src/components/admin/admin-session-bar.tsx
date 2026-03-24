"use client";

import { useAdminAuth } from "@/context/admin-auth-context";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

export function AdminSessionBar() {
  const t = useTranslations("admin");
  const { ready, user, logout, isAuthenticated } = useAdminAuth();
  const router = useRouter();

  if (!ready || !isAuthenticated() || !user) return null;

  const handleLogout = () => {
    logout();
    router.replace("/admin/login");
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <span
        className="max-w-[220px] truncate rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-ink"
        title={`${user.name} · ${user.email}`}
      >
        <span className="text-stone">{t("authBadgeLabel")}</span>{" "}
        <span className="text-ink">{user.name}</span>
      </span>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-zinc-50"
      >
        {t("authLogout")}
      </button>
    </div>
  );
}
