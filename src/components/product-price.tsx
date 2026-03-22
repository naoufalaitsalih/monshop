"use client";

import type { Product } from "@/data/products";
import { hasPromo } from "@/lib/pricing";

type Props = {
  product: Product;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function ProductPrice({ product, size = "sm", className = "" }: Props) {
  const promo = hasPromo(product);
  const priceClass =
    size === "lg"
      ? "text-2xl sm:text-3xl"
      : size === "md"
        ? "text-lg"
        : "text-sm";

  return (
    <div className={`flex flex-wrap items-baseline gap-2 ${className}`}>
      <span className={`font-semibold text-ink ${priceClass}`}>
        {product.priceMad} MAD
      </span>
      {promo && product.compareAtPriceMad != null && (
        <span className="text-sm text-stone line-through decoration-ink/30">
          {product.compareAtPriceMad} MAD
        </span>
      )}
    </div>
  );
}
