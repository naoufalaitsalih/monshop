"use client";

import { useTranslations } from "next-intl";
import type { Category } from "@/data/products";
import type { Order } from "@/context/orders-context";
import { maxCategoryBar, unitsSoldByCategory } from "@/lib/admin-stats";

const CATS: Category[] = [
  "sandals",
  "bags",
  "dresses",
  "sunglasses",
  "pack",
];

export function AdminCategorySalesChart({ orders }: { orders: Order[] }) {
  const t = useTranslations("categories");
  const units = unitsSoldByCategory(orders);
  const max = maxCategoryBar(units);

  return (
    <div className="space-y-4">
      {CATS.map((cat) => {
        const n = units[cat];
        const pct = Math.round((n / max) * 100);
        return (
          <div key={cat}>
            <div className="flex justify-between text-xs font-medium text-ink">
              <span>{t(cat)}</span>
              <span className="tabular-nums text-stone">{n}</span>
            </div>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
