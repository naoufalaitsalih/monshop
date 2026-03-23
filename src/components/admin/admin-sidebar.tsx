"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";

const links = [
  { href: "/admin", navKey: "navDashboard" as const, match: (p: string) => p === "/admin" },
  {
    href: "/admin/products",
    navKey: "navProducts" as const,
    match: (p: string) => p.startsWith("/admin/products"),
  },
  {
    href: "/admin/categories",
    navKey: "navCategories" as const,
    match: (p: string) => p.startsWith("/admin/categories"),
  },
  {
    href: "/admin/orders",
    navKey: "navOrders" as const,
    match: (p: string) => p.startsWith("/admin/orders"),
  },
] as const;

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = useTranslations("admin");

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
        {links.map((l) => {
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
