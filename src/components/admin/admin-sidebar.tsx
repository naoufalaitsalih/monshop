"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { useAdminRbac } from "@/context/admin-rbac-context";

const links = [
  {
    href: "/admin",
    perm: "dashboard",
    navKey: "navDashboard" as const,
    match: (p: string) => p === "/admin",
  },
  {
    href: "/admin/products",
    perm: "products.view",
    navKey: "navProducts" as const,
    match: (p: string) => p.startsWith("/admin/products"),
  },
  {
    href: "/admin/categories",
    perm: "categories.view",
    navKey: "navCategories" as const,
    match: (p: string) => p.startsWith("/admin/categories"),
  },
  {
    href: "/admin/orders",
    perm: "orders.view",
    navKey: "navOrders" as const,
    match: (p: string) => p.startsWith("/admin/orders"),
  },
  {
    href: "/admin/clients",
    perm: "clients.view",
    navKey: "navClients" as const,
    match: (p: string) => p.startsWith("/admin/clients"),
  },
  {
    href: "/admin/users",
    perm: "users.view",
    navKey: "navUsers" as const,
    match: (p: string) => p.startsWith("/admin/users"),
  },
  {
    href: "/admin/roles",
    perm: "roles.view",
    navKey: "navRoles" as const,
    match: (p: string) => p.startsWith("/admin/roles"),
  },
] as const;

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = useTranslations("admin");
  const { canAccess, hydrated } = useAdminRbac();
  const visible = links.filter((l) => !hydrated || canAccess(l.perm));

  return (
    <aside className="flex h-full flex-col border-e border-white/10 bg-ink text-white">
      <div className="border-b border-white/10 px-6 py-6">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="font-display text-xl tracking-tight text-white"
        >
          {t("brand")}
          <span className="mt-1 block text-[10px] font-sans font-semibold uppercase tracking-[0.25em] text-accent">
            {t("brandSub")}
          </span>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Admin">
        {visible.map((l) => {
          const active = l.match(pathname);
          return (
            <Link
              key={l.href}
              href={l.href}
              onClick={onNavigate}
              className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-accent text-ink"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {t(l.navKey)}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="block rounded-xl px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          {t("viewShop")}
        </Link>
      </div>
    </aside>
  );
}
