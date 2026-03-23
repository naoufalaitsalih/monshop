import type { PackItem, Product } from "@/data/products";

export function sumPackItemsPriceMad(
  catalog: Product[],
  items: PackItem[]
): number {
  return items.reduce((acc, it) => {
    if (it.type === "existing") {
      const p = catalog.find((x) => x.id === it.productId);
      return acc + (p?.priceMad ?? 0);
    }
    return acc + Math.max(0, Number(it.priceMad) || 0);
  }, 0);
}

/** Somme des lignes × (1 - réduction%). */
export function computePackSuggestedPriceMad(
  items: PackItem[],
  catalog: Product[],
  discountPercent: number
): number {
  const sum = sumPackItemsPriceMad(catalog, items);
  const d = Math.min(100, Math.max(0, discountPercent));
  return Math.max(1, Math.round(sum * (1 - d / 100)));
}
