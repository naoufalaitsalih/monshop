import type { Order } from "@/context/orders-context";

export function countOrdersByStatus(orders: Order[]) {
  let pending = 0;
  let confirmed = 0;
  for (const o of orders) {
    if (o.status === "confirmed") confirmed += 1;
    else pending += 1;
  }
  return { pending, confirmed };
}

export type TopProduct = {
  productId: string;
  nameFr: string;
  nameAr: string;
  quantity: number;
};

export function getTopProductByQuantity(orders: Order[]): TopProduct | null {
  const map = new Map<
    string,
    { nameFr: string; nameAr: string; quantity: number }
  >();
  for (const o of orders) {
    for (const li of o.items) {
      const prev = map.get(li.productId);
      if (prev) {
        prev.quantity += li.quantity;
      } else {
        map.set(li.productId, {
          nameFr: li.nameFr,
          nameAr: li.nameAr,
          quantity: li.quantity,
        });
      }
    }
  }
  let best: TopProduct | null = null;
  for (const [productId, v] of map) {
    if (!best || v.quantity > best.quantity) {
      best = {
        productId,
        nameFr: v.nameFr,
        nameAr: v.nameAr,
        quantity: v.quantity,
      };
    }
  }
  return best;
}
