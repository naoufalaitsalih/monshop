"use client";

import Image from "next/image";
import { useMemo } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useProductsCatalog } from "@/context/products-context";
import { useShopCategories } from "@/context/categories-context";
import { useOrders } from "@/context/orders-context";
import { StatCard } from "@/components/admin/stat-card";
import { AdminCategorySalesChart } from "@/components/admin/admin-category-sales";
import { AdminProductSales } from "@/components/admin/admin-product-sales";
import { productImageUnoptimized } from "@/lib/product-image";
import { productPrimaryImage } from "@/lib/product-media";
import { isPackProduct } from "@/data/products";
import { totalRevenueMad } from "@/lib/admin-stats";
import { useLocale } from "next-intl";
import { productName } from "@/lib/product-labels";
import { RequireAdminAccess } from "@/components/admin/require-admin-access";
import { useAdminRbac } from "@/context/admin-rbac-context";
import { useAdminClickLog } from "@/hooks/use-admin-click-log";

export default function AdminDashboardPage() {
  return (
    <RequireAdminAccess permission="dashboard">
      <AdminDashboardContent />
    </RequireAdminAccess>
  );
}

function AdminDashboardContent() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const { canAccess } = useAdminRbac();
  const { logClick } = useAdminClickLog();
  const { products, hydrated } = useProductsCatalog();
  const { orders, hydrated: ordersHydrated } = useOrders();
  const {
    categories: shopCategories,
    hydrated: categoriesHydrated,
    label: categoryLabel,
  } = useShopCategories();

  const recent = useMemo(() => {
    return [...products].slice(-5).reverse();
  }, [products]);

  const revenue = useMemo(() => totalRevenueMad(orders), [orders]);

  if (!hydrated || !ordersHydrated || !categoriesHydrated) {
    return (
      <div className="space-y-8">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-zinc-200" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-zinc-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl text-ink">{t("dashboardTitle")}</h1>
        <p className="mt-2 text-sm text-stone">{t("dashboardSubtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {canAccess("products.view") ? (
          <StatCard title={t("statProducts")} value={products.length} />
        ) : null}
        {canAccess("categories.view") ? (
          <StatCard title={t("statCategories")} value={shopCategories.length} />
        ) : null}
        {canAccess("orders.view") ? (
          <Link
            href="/admin/orders"
            onClick={() => logClick("CLICK_DASH_ORDERS_CARD", "dashboard", "")}
            className="block transition hover:opacity-95"
          >
            <StatCard title={t("statOrders")} value={orders.length} />
          </Link>
        ) : null}
        {canAccess("orders.view") ? (
          <StatCard
            title={t("statRevenue")}
            value={revenue}
            hint="MAD"
          />
        ) : null}
      </div>

      {canAccess("orders.view") ? (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl text-ink">{t("statsSection")}</h2>
          <p className="mt-1 text-sm text-stone">{t("salesByCategory")}</p>
          <p className="mt-2 text-xs text-stone">{t("statShopHint")}</p>
          <div className="mt-6 max-w-xl">
            <AdminCategorySalesChart orders={orders} />
          </div>
        </section>
      ) : null}

      {canAccess("orders.view") ? <AdminProductSales orders={orders} /> : null}

      {canAccess("products.view") ? (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-xl text-ink">
              {t("recentProducts")}
            </h2>
            <Link
              href="/admin/products"
              onClick={() =>
                logClick("CLICK_DASH_SEE_ALL_PRODUCTS", "dashboard", "")
              }
              className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
            >
              {t("seeAll")}
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
                    src={productPrimaryImage(p)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="56px"
                    unoptimized={productImageUnoptimized(
                      productPrimaryImage(p)
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">
                    {productName(p, locale)}
                    {isPackProduct(p) ? (
                      <span className="ms-2 rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-ink">
                        {t("badgePack")}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-stone">
                    {categoryLabel(p.category, locale)} · {p.priceMad} MAD
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
