import type { Product } from "@/data/products";

export function hasPromo(product: Product): boolean {
  return (
    product.isPromo === true &&
    product.compareAtPriceMad != null &&
    product.compareAtPriceMad > product.priceMad
  );
}
