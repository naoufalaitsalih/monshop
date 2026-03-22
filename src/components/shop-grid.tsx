"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { products, type Category } from "@/data/products";
import { ProductCard } from "./product-card";
import { ShopFilters } from "./shop-filters";

const absoluteMax = Math.max(...products.map((p) => p.priceMad), 0);

export function ShopGrid() {
  const t = useTranslations("shop");
  const [category, setCategory] = useState<Category | "all">("all");
  const [maxPrice, setMaxPrice] = useState(absoluteMax);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const catOk = category === "all" || p.category === category;
      const priceOk = p.priceMad <= maxPrice;
      return catOk && priceOk;
    });
  }, [category, maxPrice]);

  const reset = () => {
    setCategory("all");
    setMaxPrice(absoluteMax);
  };

  return (
    <div className="space-y-10">
      <ShopFilters
        category={category}
        maxPrice={maxPrice}
        absoluteMax={absoluteMax}
        onCategoryChange={setCategory}
        onMaxPriceChange={setMaxPrice}
        onReset={reset}
      />
      <p className="text-sm font-medium text-stone">
        {t("pieceCount", { count: filtered.length })}
      </p>
      {filtered.length === 0 ? (
        <p className="py-16 text-center text-stone">{t("noResults")}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product, i) => (
            <li key={product.id}>
              <ProductCard product={product} index={i} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
