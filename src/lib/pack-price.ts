import type { Product } from "@/data/products";

/** Prix suggéré pour un pack : somme des prix unitaires × (1 - réduction%). */
export function computePackSuggestedPriceMad(
  catalog: Product[],
  packItemIds: string[],
  discountPercent: number
): number {
  const sum = packItemIds.reduce((acc, id) => {
    const p = catalog.find((x) => x.id === id);
    return acc + (p?.priceMad ?? 0);
  }, 0);
  const d = Math.min(100, Math.max(0, discountPercent));
  return Math.max(1, Math.round(sum * (1 - d / 100)));
}
