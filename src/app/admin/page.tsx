"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useProductsCatalog } from "@/context/products-context";
import { useOrders } from "@/context/orders-context";
import { StatCard } from "@/components/admin/stat-card";
import { categoryLabelFr } from "@/lib/admin-categories";
import { productImageUnoptimized } from "@/lib/product-image";

export default function AdminDashboardPage() {
  const { products, hydrated, categoryCount } = useProductsCatalog();
  const { orders, hydrated: ordersHydrated } = useOrders();

  const recent = useMemo(() => {
    return [...products].slice(-5).reverse();
  }, [products]);

  if (!hydrated || !ordersHydrated) {
    return (
      <div className="space-y-8">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-zinc-200" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-zinc-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl text-ink">Dashboard</h1>
        <p className="mt-2 text-sm text-stone">
          Vue d&apos;ensemble du catalogue (données locales — prêt pour une API).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Produits" value={products.length} />
        <StatCard title="Catégories" value={categoryCount} />
        <Link
          href="/admin/orders"
          className="block transition hover:opacity-95"
        >
          <StatCard
            title="Commandes"
            value={orders.length}
            hint="Cliquez pour le détail"
          />
        </Link>
        <StatCard
          title="Boutique"
          value="FR / AR"
          hint="Catalogue synchronisé avec le site."
        />
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-xl text-ink">Produits récents</h2>
          <Link
            href="/admin/products"
            className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            Voir tout
          </Link>
        </div>
        <ul className="mt-6 divide-y divide-zinc-100">
          {recent.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                <Image
                  src={p.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="56px"
                  unoptimized={productImageUnoptimized(p.image)}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{p.nameFr}</p>
                <p className="text-xs text-stone">
                  {categoryLabelFr(p.category)} · {p.priceMad} MAD
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
