"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import type { Order } from "@/context/orders-context";
import { useShopCategories } from "@/context/categories-context";
import { maxCategoryBar, unitsSoldByCategory } from "@/lib/admin-stats";

type Props = {
  orders: Order[];
};

export function AdminCategorySalesChart({ orders }: Props) {
  const locale = useLocale();
  const { categories, label } = useShopCategories();

  const units = useMemo(() => unitsSoldByCategory(orders), [orders]);
  const max = useMemo(() => maxCategoryBar(units), [units]);

  const orderedIds = useMemo(() => {
    const fromShop = categories.map((c) => c.id);
    const extra = Object.keys(units).filter((id) => !fromShop.includes(id));
    return [...fromShop, ...extra.sort()];
  }, [categories, units]);

  return (
    <div className="space-y-4">
      {orderedIds.map((cat) => {
        const n = units[cat] ?? 0;
        const pct = Math.round((n / max) * 100);
        const name = label(cat, locale);
        return (
          <div key={cat}>
            <div className="flex justify-between text-xs font-medium text-ink">
              <span>{name}</span>
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
