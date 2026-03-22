import type { Product } from "@/data/products";

export function productName(product: Product, locale: string) {
  return locale === "ar" ? product.nameAr : product.nameFr;
}

export function productShortDescription(product: Product, locale: string) {
  return locale === "ar"
    ? product.shortDescriptionAr
    : product.shortDescriptionFr;
}

export function productLongDescription(product: Product, locale: string) {
  return locale === "ar"
    ? product.longDescriptionAr
    : product.longDescriptionFr;
}
