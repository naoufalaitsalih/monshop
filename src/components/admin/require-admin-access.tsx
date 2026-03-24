"use client";

import { useAdminRbac } from "@/context/admin-rbac-context";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

type Props = {
  permission: string;
  children: React.ReactNode;
};

export function RequireAdminAccess({ permission, children }: Props) {
  const { canAccess, hydrated } = useAdminRbac();
  const t = useTranslations("admin");

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-zinc-200" />
        <div className="h-48 animate-pulse rounded-2xl bg-zinc-200" />
      </div>
    );
  }

  if (!canAccess(permission)) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-red-200 bg-red-50 px-8 py-12 text-center shadow-sm">
        <p className="font-display text-xl text-red-950">{t("accessDeniedTitle")}</p>
        <p className="mt-3 text-sm text-red-900/90">{t("accessDeniedBody")}</p>
        <Link
          href="/admin"
          className="mt-8 inline-block rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:bg-ink/90"
        >
          {t("accessDeniedBack")}
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
