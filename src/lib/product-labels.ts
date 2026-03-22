import type { Product } from "@/data/products";

export function productName(product: Product, locale: string) {
  return locale === "ar" ? product.nameAr : product.nameFr;
}

export function productDescription(product: Product, locale: string) {
  return locale === "ar" ? product.descriptionAr : product.descriptionFr;
}
