"use client";

import { useTranslations } from "next-intl";

export type ShopFilterCategoryOption = {
  id: string;
  label: string;
};

type Props = {
  category: string | "all";
  categoryOptions: ShopFilterCategoryOption[];
  maxPrice: number;
  absoluteMax: number;
  onCategoryChange: (c: string | "all") => void;
  onMaxPriceChange: (n: number) => void;
  onReset: () => void;
};

export function ShopFilters({
  category,
  categoryOptions,
  maxPrice,
  absoluteMax,
  onCategoryChange,
  onMaxPriceChange,
  onReset,
}: Props) {
  const t = useTranslations("shop");

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-ink/5 bg-white p-5 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex-1 min-w-[160px]">
        <label
          htmlFor="category"
          className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone"
        >
          {t("filterCategory")}
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => {
            const v = e.target.value;
            onCategoryChange(v === "all" ? "all" : v);
          }}
          className="w-full rounded-xl border border-ink/10 bg-sand/50 px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        >
          <option value="all">{t("allCategories")}</option>
          {categoryOptions.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 min-w-[200px]">
        <label
          htmlFor="price"
          className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone"
        >
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
