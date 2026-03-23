"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Order } from "@/context/orders-context";
import { useShopCategories } from "@/context/categories-context";
import {
  aggregateProductSales,
  filterSalesByCategoryId,
  type ProductSaleAggregate,
} from "@/lib/admin-stats";

type Tab = "all" | string;

type Props = {
  orders: Order[];
};

function SalesTable({
  rows,
  categoryLabel,
}: {
  rows: ProductSaleAggregate[];
  categoryLabel: (id?: string) => string;
}) {
  const t = useTranslations("admin");

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-8 text-center text-sm text-stone">
        {t("soldProductsEmpty")}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-stone">
            <tr>
              <th className="px-4 py-3">{t("soldColName")}</th>
              <th className="px-4 py-3">{t("soldColCategory")}</th>
              <th className="px-4 py-3">{t("soldColQty")}</th>
              <th className="px-4 py-3">{t("soldColTotal")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((r) => (
              <tr key={r.productId} className="text-ink">
                <td className="px-4 py-3">
                  <span className="font-medium">{r.nameFr}</span>
                  <span className="mt-0.5 block text-xs text-stone" dir="rtl">
                    {r.nameAr}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone">
                  {r.category ? categoryLabel(r.category) : "—"}
                </td>
                <td className="px-4 py-3 font-medium">{r.quantity}</td>
                <td className="px-4 py-3 font-medium whitespace-nowrap">
                  {r.revenueMad} MAD
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminProductSales({ orders }: Props) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const { categories, label } = useShopCategories();
  const [tab, setTab] = useState<Tab>("all");

  const allRows = useMemo(() => aggregateProductSales(orders), [orders]);

  const displayed = useMemo(() => {
    if (tab === "all") return allRows;
    return filterSalesByCategoryId(allRows, tab);
  }, [allRows, tab]);

  const categoryLabel = (id?: string) =>
    id ? label(id, locale) : "—";

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="font-display text-xl text-ink">{t("soldProductsTitle")}</h2>
      <p className="mt-1 text-sm text-stone">{t("soldProductsSubtitle")}</p>

      <div
        className="mt-4 flex flex-wrap gap-2"
        role="tablist"
        aria-label={t("soldProductsTitle")}
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "all"}
          onClick={() => setTab("all")}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
            tab === "all"
              ? "bg-ink text-white"
              : "bg-zinc-100 text-ink hover:bg-zinc-200"
          }`}
        >
          {t("soldTabAll")}
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={tab === c.id}
            onClick={() => setTab(c.id)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              tab === c.id
                ? "bg-ink text-white"
                : "bg-zinc-100 text-ink hover:bg-zinc-200"
            }`}
          >
            {locale === "ar" ? c.nameAr : c.nameFr}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <SalesTable rows={displayed} categoryLabel={categoryLabel} />
      </div>
    </section>
  );
}
