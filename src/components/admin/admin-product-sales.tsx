"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { Category } from "@/data/products";
import type { Order } from "@/context/orders-context";
import {
  aggregateProductSales,
  groupSalesByCategory,
  type ProductSaleAggregate,
} from "@/lib/admin-stats";

const CATEGORIES: Category[] = ["sandals", "bags", "dresses", "sunglasses"];

type Tab = "all" | Category;

type Props = {
  orders: Order[];
};

function SalesTable({ rows }: { rows: ProductSaleAggregate[] }) {
  const t = useTranslations("admin");
  const tc = useTranslations("categories");

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
                  {r.category ? tc(r.category) : "—"}
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
  const tc = useTranslations("categories");
  const [tab, setTab] = useState<Tab>("all");

  const allRows = useMemo(() => aggregateProductSales(orders), [orders]);
  const byCat = useMemo(() => groupSalesByCategory(allRows), [allRows]);

  const displayed =
    tab === "all" ? allRows : byCat[tab as Category] ?? [];

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
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={tab === c}
            onClick={() => setTab(c)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              tab === c
                ? "bg-ink text-white"
                : "bg-zinc-100 text-ink hover:bg-zinc-200"
            }`}
          >
            {tc(c)}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <SalesTable rows={displayed} />
      </div>
    </section>
  );
}
