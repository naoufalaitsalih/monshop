"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Produits" },
  { href: "/admin/add-product", label: "Ajouter un produit" },
] as const;

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col border-e border-white/10 bg-ink text-white">
      <div className="border-b border-white/10 px-6 py-6">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="font-display text-xl tracking-tight text-white"
        >
          Maison Moda
          <span className="mt-1 block text-[10px] font-sans font-semibold uppercase tracking-[0.25em] text-accent">
            Admin
          </span>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Administration">
        {links.map((l) => {
          const active =
            l.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(l.href);
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
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <Link
          href="/fr"
          onClick={onNavigate}
          className="block rounded-xl px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          Voir la boutique
        </Link>
      </div>
    </aside>
  );
}
