"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { products as seedProducts, type Category } from "@/data/products";
import { useProductsCatalog } from "@/context/products-context";
import { ProductCard } from "./product-card";
import { ShopFilters } from "./shop-filters";

const seedMax = Math.max(...seedProducts.map((p) => p.priceMad), 0);

function parseCategory(value: string | null): Category | "all" {
  if (
    value === "sandals" ||
    value === "bags" ||
    value === "sunglasses" ||
    value === "dresses" ||
    value === "pack"
  ) {
    return value;
  }
  return "all";
}

export function ShopGrid() {
  const t = useTranslations("shop");
  const { products, hydrated } = useProductsCatalog();
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<Category | "all">("all");
  const absoluteMax = useMemo(
    () => Math.max(seedMax, ...products.map((p) => p.priceMad), 1),
    [products]
  );
  const [maxPrice, setMaxPrice] = useState(seedMax);
  const priceRangeInitialized = useRef(false);

  useEffect(() => {
    const c = parseCategory(searchParams.get("category"));
    setCategory(c);
  }, [searchParams]);

  useEffect(() => {
    if (!hydrated || priceRangeInitialized.current) return;
    priceRangeInitialized.current = true;
    setMaxPrice(absoluteMax);
  }, [hydrated, absoluteMax]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const catOk = category === "all" || p.category === category;
      const priceOk = p.priceMad <= maxPrice;
      return catOk && priceOk;
    });
  }, [category, maxPrice, products]);

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
