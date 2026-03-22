"use client";

import { notFound } from "next/navigation";
import { useProductsCatalog } from "@/context/products-context";
import { ProductDetail } from "@/components/product-detail";

export function CatalogProductPage({ slug }: { slug: string }) {
  const { products, hydrated } = useProductsCatalog();
  const product = products.find((p) => p.slug === slug);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-sand" />
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div className="aspect-[3/4] animate-pulse rounded-2xl bg-sand" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-sand" />
            <div className="h-24 animate-pulse rounded-xl bg-sand" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
