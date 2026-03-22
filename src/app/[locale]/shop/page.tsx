import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { ShopGrid } from "@/components/shop-grid";

function ShopGridFallback() {
  return (
    <div
      className="h-[min(24rem,50vh)] animate-pulse rounded-2xl bg-sand/80"
      aria-hidden
    />
  );
}

export default async function ShopPage() {
  const t = await getTranslations("shop");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-10">
        <h1 className="font-display text-3xl text-ink sm:text-4xl">{t("title")}</h1>
        <p className="mt-2 max-w-xl text-stone">{t("subtitle")}</p>
      </header>
      <Suspense fallback={<ShopGridFallback />}>
        <ShopGrid />
      </Suspense>
    </div>
  );
}
