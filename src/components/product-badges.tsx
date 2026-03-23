"use client";

import { useTranslations } from "next-intl";
import type { Product } from "@/data/products";
import { hasPromo } from "@/lib/pricing";

export function ProductBadges({ product }: { product: Product }) {
  const t = useTranslations("shop");
  const showPromo = hasPromo(product);
  const showPack = product.isPack === true;

  if (!product.isNew && !showPromo && !showPack) return null;

  return (
    <div className="pointer-events-none absolute start-3 top-3 z-10 flex flex-wrap gap-2">
      {showPack && (
        <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-ink shadow-sm ring-1 ring-ink/10">
          {t("badgePack")}
        </span>
      )}
      {product.isNew && (
        <span className="rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
          {t("badgeNew")}
        </span>
      )}
      {showPromo && (
        <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm ring-2 ring-white/40">
          {t("badgePromo")}
        </span>
      )}
    </div>
  );
}
