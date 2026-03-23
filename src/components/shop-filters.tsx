"use client";

import { useTranslations } from "next-intl";
import type { Category } from "@/data/products";

const categories: { value: Category | "all"; key: Category | "allCategories" }[] =
  [
    { value: "all", key: "allCategories" },
    { value: "sandals", key: "sandals" },
    { value: "bags", key: "bags" },
    { value: "sunglasses", key: "sunglasses" },
    { value: "dresses", key: "dresses" },
    { value: "pack", key: "pack" },
  ];

type Props = {
  category: Category | "all";
  maxPrice: number;
  absoluteMax: number;
  onCategoryChange: (c: Category | "all") => void;
  onMaxPriceChange: (n: number) => void;
  onReset: () => void;
};

export function ShopFilters({
  category,
  maxPrice,
  absoluteMax,
  onCategoryChange,
  onMaxPriceChange,
  onReset,
}: Props) {
  const t = useTranslations("shop");
  const tc = useTranslations("categories");

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-ink/5 bg-white p-5 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex-1 min-w-[160px]">
        <label htmlFor="category" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone">
          {t("filterCategory")}
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) =>
            onCategoryChange(e.target.value as Category | "all")
          }
          className="w-full rounded-xl border border-ink/10 bg-sand/50 px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        >
          {categories.map(({ value, key }) => (
            <option key={value} value={value}>
              {key === "allCategories"
                ? t("allCategories")
                : tc(key)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="price" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone">
          {t("filterPrice")}: {maxPrice} MAD
        </label>
        <input
          id="price"
          type="range"
          min={0}
          max={absoluteMax}
          step={50}
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(Number(e.target.value))}
          className="w-full accent-accent"
        />
      </div>
      <button
        type="button"
        onClick={onReset}
        className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-sand"
      >
        {t("reset")}
      </button>
    </div>
  );
}
