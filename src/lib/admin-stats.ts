import type { Order } from "@/context/orders-context";

export function totalRevenueMad(orders: Order[]): number {
  return orders.reduce((s, o) => s + o.total, 0);
}

export function unitsSoldByCategory(orders: Order[]): Record<string, number> {
  const acc: Record<string, number> = {};
  for (const o of orders) {
    for (const line of o.items) {
      const c = line.category?.trim();
      if (!c) continue;
      acc[c] = (acc[c] ?? 0) + line.quantity;
    }
  }
  return acc;
}

export function maxCategoryBar(units: Record<string, number>): number {
  const vals = Object.values(units);
  return Math.max(1, ...vals, 1);
}

export type ProductSaleAggregate = {
  productId: string;
  nameFr: string;
  nameAr: string;
  category?: string;
  quantity: number;
  revenueMad: number;
};

/** Agrège les ventes par productId (lignes de commande). */
export function aggregateProductSales(orders: Order[]): ProductSaleAggregate[] {
  const map = new Map<
    string,
    {
      nameFr: string;
      nameAr: string;
      category?: string;
      quantity: number;
      revenueMad: number;
    }
  >();

  for (const o of orders) {
    for (const line of o.items) {
      const pid = line.productId;
      const prev = map.get(pid);
      if (prev) {
        prev.quantity += line.quantity;
        prev.revenueMad += line.lineTotalMad;
        if (!prev.category && line.category) prev.category = line.category;
      } else {
        map.set(pid, {
          nameFr: line.nameFr,
          nameAr: line.nameAr,
          category: line.category,
          quantity: line.quantity,
          revenueMad: line.lineTotalMad,
        });
      }
    }
  }

  return Array.from(map.entries())
    .map(([productId, v]) => ({
      productId,
      ...v,
    }))
    .sort((a, b) => b.revenueMad - a.revenueMad);
}

/** Filtre les lignes par id de catégorie. */
export function filterSalesByCategoryId(
  rows: ProductSaleAggregate[],
  categoryId: string
): ProductSaleAggregate[] {
  return rows.filter((r) => r.category === categoryId);
}
