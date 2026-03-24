"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/language-switcher";
import { AdminRbacProvider } from "@/context/admin-rbac-context";
import { AdminAuditLogProvider } from "@/context/admin-audit-context";
import { AdminAuthProvider } from "@/context/admin-auth-context";
import { AdminProtectedRoute } from "@/components/admin/admin-protected-route";
import { AdminSessionBar } from "./admin-session-bar";
import { AdminSidebar } from "./admin-sidebar";

function isAdminLoginPath(pathname: string): boolean {
  return pathname === "/admin/login" || pathname.endsWith("/admin/login");
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const loginOnly = isAdminLoginPath(pathname);

  return (
    <AdminRbacProvider>
      <AdminAuditLogProvider>
        <AdminAuthProvider>
          {loginOnly ? (
            <div className="min-h-screen bg-zinc-100">{children}</div>
          ) : (
            <AdminProtectedRoute>
              <AdminShellLayout>{children}</AdminShellLayout>
            </AdminProtectedRoute>
          )}
        </AdminAuthProvider>
      </AdminAuditLogProvider>
    </AdminRbacProvider>
  );
}

function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("admin");

  return (
    <div className="flex min-h-screen bg-zinc-100">
      <div className="hidden w-60 shrink-0 lg:block lg:sticky lg:top-0 lg:h-screen lg:self-start">
        <AdminSidebar />
      </div>

      <div
        className={`fixed inset-0 z-40 bg-black/50 transition lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      />

      <aside
        className={`fixed start-0 top-0 z-50 h-full w-64 max-w-[85vw] transition-transform duration-200 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar onNavigate={() => setOpen(false)} />
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-ink lg:hidden"
            aria-expanded={open}
            aria-label={t("menu")}
          >
            {t("menu")}
          </button>
          <span className="text-xs font-semibold uppercase tracking-wider text-stone lg:hidden">
            {t("brandSub")}
          </span>
          <div className="ms-auto flex items-center gap-3">
            <AdminSessionBar />
            <LanguageSwitcher />
          </div>
        </div>
        <div className="flex-1 p-4 sm:p-6 lg:p-10">{children}</div>
      </div>
    </div>
  );
}
