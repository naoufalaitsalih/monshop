"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import type { Product } from "@/data/products";
import { getRelatedProductsFromList } from "@/data/products";
import { useProductsCatalog } from "@/context/products-context";
import { productImageUnoptimized } from "@/lib/product-image";
import {
  productLongDescription,
  productName,
  productShortDescription,
} from "@/lib/product-labels";
import { AddToCartButton } from "./add-to-cart-button";
import { ProductBadges } from "./product-badges";
import { ProductCard } from "./product-card";
import { ProductPrice } from "./product-price";

type Props = {
  product: Product;
};

export function ProductDetail({ product }: Props) {
  const locale = useLocale();
  const t = useTranslations("product");
  const { products: catalog } = useProductsCatalog();
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [quantity, setQuantity] = useState(1);

  const related = getRelatedProductsFromList(
    catalog,
    product.category,
    product.id
  );
  const backArrow = locale === "ar" ? "→" : "←";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14"
    >
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-sm font-medium text-stone underline-offset-4 transition hover:text-ink hover:underline"
      >
        <span aria-hidden>{backArrow}</span>
        {t("back")}
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-gradient-to-b from-sand to-white shadow-md ring-1 ring-ink/5"
          >
            <ProductBadges product={product} />
            <Image
              src={product.images[activeImage] ?? product.image}
              alt={productName(product, locale)}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              unoptimized={productImageUnoptimized(
                product.images[activeImage] ?? product.image
              )}
            />
          </motion.div>
          {product.images.length > 1 && (
            <div
              className="mt-4 flex gap-2 overflow-x-auto pb-1 sm:gap-3"
              role="tablist"
              aria-label={t("galleryLabel")}
            >
              {product.images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  role="tab"
                  aria-selected={activeImage === i}
                  onClick={() => setActiveImage(i)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-20 sm:w-20 ${
                    activeImage === i
                      ? "border-accent shadow-md ring-2 ring-accent/25"
                      : "border-transparent opacity-75 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                    unoptimized={productImageUnoptimized(src)}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Maison Moda
            </p>
          </div>
          <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl md:text-[2.35rem] leading-tight">
            {productName(product, locale)}
          </h1>

          <div className="mt-4">
            <ProductPrice product={product} size="lg" />
          </div>

          <p className="mt-5 text-sm leading-relaxed text-stone sm:text-base">
            {productShortDescription(product, locale)}
          </p>

          <div className="mt-8 space-y-6">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone">
                {t("size")}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`min-w-11 rounded-full border px-4 py-2 text-sm font-medium transition ${
                      size === s
                        ? "border-ink bg-ink text-white shadow-md"
                        : "border-ink/15 text-ink hover:border-accent/50 hover:bg-sand/80"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="qty"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone"
              >
                {t("quantity")}
              </label>
              <input
                id="qty"
                type="number"
                min={1}
                max={99}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Number(e.target.value) || 1))
                }
                className="w-24 rounded-xl border border-ink/10 bg-white px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <AddToCartButton product={product} size={size} quantity={quantity} />
          </div>

          <div className="mt-12 border-t border-ink/10 pt-10">
            <h2 className="font-display text-lg text-ink">{t("details")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-stone sm:text-base">
              {productLongDescription(product, locale)}
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 border-t border-ink/10 pt-16">
          <h2 className="font-display text-2xl text-ink">{t("youMayLike")}</h2>
          <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <li key={p.id}>
                <ProductCard product={p} index={i} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </motion.div>
  );
}
