"use client";

import {
  FileText,
  LayoutDashboard,
  LayoutGrid,
  Moon,
  Package,
  type LucideIcon,
  Shield,
  ShoppingCart,
  Sun,
  UserCog,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { useAdminRbac } from "@/context/admin-rbac-context";
import { useAdminTheme } from "@/context/admin-theme-context";
import { useAdminClickLog } from "@/hooks/use-admin-click-log";
import type { ClickAuditAction } from "@/lib/admin-audit-log";
import { cn } from "@/lib/cn";

const links: ReadonlyArray<{
  href: string;
  perm: string;
  logAction: ClickAuditAction;
  navKey:
    | "navDashboard"
    | "navProducts"
    | "navCategories"
    | "navOrders"
    | "navClients"
    | "navUsers"
    | "navRoles"
    | "navLogs";
  match: (p: string) => boolean;
  Icon: LucideIcon;
}> = [
  {
    href: "/admin",
    perm: "dashboard",
    logAction: "CLICK_NAV_DASHBOARD",
    navKey: "navDashboard",
    match: (p) => p === "/admin",
    Icon: LayoutDashboard,
  },
  {
    href: "/admin/products",
    perm: "products.view",
    logAction: "CLICK_NAV_PRODUCTS",
    navKey: "navProducts",
    match: (p) => p.startsWith("/admin/products"),
    Icon: Package,
  },
  {
    href: "/admin/categories",
    perm: "categories.view",
    logAction: "CLICK_NAV_CATEGORIES",
    navKey: "navCategories",
    match: (p) => p.startsWith("/admin/categories"),
    Icon: LayoutGrid,
  },
  {
    href: "/admin/orders",
    perm: "orders.view",
    logAction: "CLICK_NAV_ORDERS",
    navKey: "navOrders",
    match: (p) => p.startsWith("/admin/orders"),
    Icon: ShoppingCart,
  },
  {
    href: "/admin/clients",
    perm: "clients.view",
    logAction: "CLICK_NAV_CLIENTS",
    navKey: "navClients",
    match: (p) => p.startsWith("/admin/clients"),
    Icon: Users,
  },
  {
    href: "/admin/users",
    perm: "users.view",
    logAction: "CLICK_NAV_USERS",
    navKey: "navUsers",
    match: (p) => p.startsWith("/admin/users"),
    Icon: UserCog,
  },
  {
    href: "/admin/roles",
    perm: "roles.view",
    logAction: "CLICK_NAV_ROLES",
    navKey: "navRoles",
    match: (p) => p.startsWith("/admin/roles"),
    Icon: Shield,
  },
  {
    href: "/admin/logs",
    perm: "audit.view",
    logAction: "CLICK_NAV_LOGS",
    navKey: "navLogs",
    match: (p) => p.startsWith("/admin/logs"),
    Icon: FileText,
  },
];

function AdminThemeToggle() {
  const t = useTranslations("admin");
  const { theme, toggleTheme } = useAdminTheme();
  const { logClick } = useAdminClickLog();

  return (
    <button
      type="button"
      onClick={() => {
        logClick("CLICK_UI_THEME_TOGGLE", "ui", `from=${theme}`);
        toggleTheme();
      }}
      className="flex w-full items-center gap-3 rounded-xl border border-zinc-200/80 bg-zinc-50/80 px-3 py-2.5 text-left text-sm font-medium text-ink transition hover:border-accent/40 hover:bg-accent/10 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-200 dark:hover:border-accent/35 dark:hover:bg-accent/15"
      aria-label={t("themeToggleAria")}
    >
      <span className="relative flex size-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:ring-zinc-600">
        <Sun
          className={cn(
            "absolute size-[1.125rem] text-amber-500 transition-all duration-300 ease-out",
            theme === "dark" ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
          )}
          aria-hidden
        />
        <Moon
          className={cn(
            "absolute size-[1.125rem] text-accent transition-all duration-300 ease-out",
            theme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
          )}
          aria-hidden
        />
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block text-xs font-semibold uppercase tracking-wider text-stone dark:text-zinc-500">
          {t("themeLabel")}
        </span>
        <span className="block text-sm font-semibold text-ink dark:text-zinc-100">
          {theme === "dark" ? t("themeDark") : t("themeLight")}
        </span>
      </span>
    </button>
  );
}

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = useTranslations("admin");
  const { canAccess, hydrated } = useAdminRbac();
  const { logClick } = useAdminClickLog();
  const visible = links.filter((l) => !hydrated || canAccess(l.perm));

  return (
    <aside className="flex h-full w-64 max-w-full flex-col border-e border-zinc-200/90 bg-white shadow-[4px_0_24px_-12px_rgba(0,0,0,0.08)] dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-[4px_0_32px_-12px_rgba(0,0,0,0.5)]">
      <div className="border-b border-zinc-100 px-5 py-6 dark:border-zinc-800/80">
        <Link
          href="/admin"
          onClick={() => {
            logClick("CLICK_NAV_DASHBOARD", "navigation", "/admin");
            onNavigate?.();
          }}
          className="group block outline-none transition"
        >
          <p className="font-display text-xl tracking-tight text-ink transition group-hover:text-accent dark:text-zinc-50">
            {t("brand")}
          </p>
          <span className="mt-1.5 block text-[10px] font-sans font-bold uppercase tracking-[0.28em] text-accent">
            {t("brandSub")}
          </span>
          <span className="mt-3 block h-0.5 w-10 rounded-full bg-gradient-to-r from-accent to-accent/40 transition-all duration-300 group-hover:w-14" />
        </Link>
      </div>

      <nav
        className="flex flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain px-3 py-4"
        aria-label="Admin"
      >
        {visible.map((l) => {
          const active = l.match(pathname);
          const Icon = l.Icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => {
                logClick(l.logAction, "navigation", l.href);
                onNavigate?.();
              }}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                active
                  ? "bg-accent/15 text-ink shadow-sm ring-1 ring-accent/25 dark:bg-accent/20 dark:text-zinc-50 dark:ring-accent/35"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-ink dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-100"
              )}
            >
              <Icon
                className={cn(
                  "size-5 shrink-0 transition-colors",
                  active
                    ? "text-accent dark:text-accent"
                    : "text-zinc-400 dark:text-zinc-500"
                )}
                strokeWidth={active ? 2.25 : 2}
                aria-hidden
              />
              <span className="truncate">{t(l.navKey)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-zinc-100 p-3 dark:border-zinc-800/80">
        <AdminThemeToggle />
        <Link
          href="/"
          onClick={() => {
            logClick("CLICK_NAV_SHOP", "navigation", "/");
            onNavigate?.();
          }}
          className="flex w-full items-center justify-center rounded-xl border border-transparent px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-stone transition hover:border-zinc-200 hover:bg-zinc-50 hover:text-ink dark:text-zinc-500 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200"
        >
          {t("viewShop")}
        </Link>
      </div>
    </aside>
  );
}
