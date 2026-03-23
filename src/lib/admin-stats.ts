import type { Category } from "@/data/products";
import type { Order } from "@/context/orders-context";

const CATEGORIES: Category[] = [
  "sandals",
  "bags",
  "dresses",
  "sunglasses",
  "pack",
];

export function totalRevenueMad(orders: Order[]): number {
  return orders.reduce((s, o) => s + o.total, 0);
}

export function unitsSoldByCategory(orders: Order[]): Record<Category, number> {
  const acc = {
    sandals: 0,
    bags: 0,
    dresses: 0,
    sunglasses: 0,
    pack: 0,
  } satisfies Record<Category, number>;
  for (const o of orders) {
    for (const line of o.items) {
      if (line.category && CATEGORIES.includes(line.category)) {
        acc[line.category] += line.quantity;
      }
    }
  }
  return acc;
}

export function maxCategoryBar(units: Record<Category, number>): number {
  return Math.max(1, ...CATEGORIES.map((c) => units[c]));
}

export type ProductSaleAggregate = {
  productId: string;
  nameFr: string;
  nameAr: string;
  category?: Category;
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
      category?: Category;
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

export function groupSalesByCategory(
  rows: ProductSaleAggregate[]
): Record<Category, ProductSaleAggregate[]> {
  const out: Record<Category, ProductSaleAggregate[]> = {
    sandals: [],
    bags: [],
    dresses: [],
    sunglasses: [],
    pack: [],
  };
  for (const r of rows) {
    const c = r.category;
    if (c && CATEGORIES.includes(c)) {
      out[c].push(r);
    }
  }
  return out;
}
