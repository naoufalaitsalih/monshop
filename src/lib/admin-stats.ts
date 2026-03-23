import type { Category } from "@/data/products";
import type { Order } from "@/context/orders-context";

const CATEGORIES: Category[] = ["sandals", "bags", "dresses", "sunglasses"];

export function totalRevenueMad(orders: Order[]): number {
  return orders.reduce((s, o) => s + o.total, 0);
}

export function unitsSoldByCategory(orders: Order[]): Record<Category, number> {
  const acc = {
    sandals: 0,
    bags: 0,
    dresses: 0,
    sunglasses: 0,
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
