"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/language-switcher";
import { AdminRbacProvider } from "@/context/admin-rbac-context";
import { AdminAuditLogProvider } from "@/context/admin-audit-context";
import { AdminAuthProvider } from "@/context/admin-auth-context";
import { AdminThemeProvider, useAdminTheme } from "@/context/admin-theme-context";
import { AdminProtectedRoute } from "@/components/admin/admin-protected-route";
import { AdminSessionBar } from "./admin-session-bar";
import { AdminSidebar } from "./admin-sidebar";
import { cn } from "@/lib/cn";
import { useAdminClickLog } from "@/hooks/use-admin-click-log";

function isAdminLoginPath(pathname: string): boolean {
  return pathname === "/admin/login" || pathname.endsWith("/admin/login");
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminThemeProvider>
      <AdminRbacProvider>
        <AdminAuditLogProvider>
          <AdminAuthProvider>
            <AdminShellInner>{children}</AdminShellInner>
          </AdminAuthProvider>
        </AdminAuditLogProvider>
      </AdminRbacProvider>
    </AdminThemeProvider>
  );
}

function AdminShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const loginOnly = isAdminLoginPath(pathname);

  if (loginOnly) {
    return <AdminLoginSurface>{children}</AdminLoginSurface>;
  }

  return (
    <AdminThemedRoot>
      <AdminProtectedRoute>
        <AdminShellLayout>{children}</AdminShellLayout>
      </AdminProtectedRoute>
    </AdminThemedRoot>
  );
}

function AdminThemedRoot({ children }: { children: React.ReactNode }) {
  const { theme } = useAdminTheme();
  return (
    <div
      className={cn(
        theme === "dark" && "dark",
        "admin-root flex min-h-screen w-full flex-row bg-zinc-100 transition-colors duration-300 dark:bg-zinc-950"
      )}
    >
      {children}
    </div>
  );
}

function AdminLoginSurface({ children }: { children: React.ReactNode }) {
  const { theme } = useAdminTheme();
  return (
    <div
      className={cn(
        theme === "dark" && "dark",
        "admin-root min-h-screen bg-zinc-100 transition-colors duration-300 dark:bg-zinc-950"
      )}
    >
      {children}
    </div>
  );
}

function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("admin");
  const { logClick } = useAdminClickLog();

  return (
    <>
      <div className="hidden w-64 shrink-0 self-start lg:sticky lg:top-0 lg:block lg:h-screen">
        <AdminSidebar />
      </div>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden",
          open
            ? "visible opacity-100"
            : "pointer-events-none invisible opacity-0"
        )}
        aria-hidden={!open}
        onClick={() => {
          logClick("CLICK_UI_MOBILE_MENU_CLOSE", "ui", "backdrop");
          setOpen(false);
        }}
      />

      <aside
        className={cn(
          "fixed start-0 top-0 z-50 h-full w-64 max-w-[min(100vw-2rem,20rem)] transition-transform duration-300 ease-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col bg-white shadow-2xl dark:bg-zinc-950 dark:shadow-black/40">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <span className="text-xs font-bold uppercase tracking-wider text-stone dark:text-zinc-500">
              {t("menu")}
            </span>
            <button
              type="button"
              onClick={() => {
                logClick("CLICK_UI_MOBILE_MENU_CLOSE", "ui", "button");
                setOpen(false);
              }}
              className="rounded-lg p-2 text-stone transition hover:bg-zinc-100 hover:text-ink dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              aria-label={t("menuClose")}
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <AdminSidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-zinc-200/90 bg-white/90 px-4 py-3 backdrop-blur-md transition-colors dark:border-zinc-800 dark:bg-zinc-900/90">
          <button
            type="button"
            onClick={() => {
              logClick("CLICK_UI_MOBILE_MENU_OPEN", "ui", "");
              setOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-ink shadow-sm transition hover:border-accent/30 hover:bg-zinc-50 lg:hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            aria-expanded={open}
            aria-label={t("menu")}
          >
            <Menu className="size-5 text-accent" aria-hidden />
            <span>{t("menu")}</span>
          </button>
          <span className="text-xs font-bold uppercase tracking-wider text-stone lg:hidden dark:text-zinc-500">
            {t("brandSub")}
          </span>
          <div className="ms-auto flex items-center gap-3">
            <AdminSessionBar />
            <LanguageSwitcher />
          </div>
        </header>
        <div className="flex-1 p-4 sm:p-6 lg:p-10">{children}</div>
      </div>
    </>
  );
}
