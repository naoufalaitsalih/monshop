"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import type { Product } from "@/data/products";
import { getRelatedProducts } from "@/data/products";
import { productDescription, productName } from "@/lib/product-labels";
import { AddToCartButton } from "./add-to-cart-button";
import { ProductCard } from "./product-card";

type Props = {
  product: Product;
};

export function ProductDetail({ product }: Props) {
  const locale = useLocale();
  const t = useTranslations("product");
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [quantity, setQuantity] = useState(1);

  const related = getRelatedProducts(product.category, product.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/shop"
        className="text-sm font-medium text-stone underline-offset-4 hover:text-ink hover:underline"
      >
        ← {t("back")}
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-sand"
          >
            <Image
              src={product.images[activeImage] ?? product.image}
              alt={productName(product, locale)}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </motion.div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 transition ${
                    activeImage === i
                      ? "border-accent"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={src} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-accent">
            {product.priceMad} MAD
          </p>
          <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
            {productName(product, locale)}
          </h1>

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
                        ? "border-ink bg-ink text-white"
                        : "border-ink/15 text-ink hover:border-ink/40"
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

          <div className="mt-10 border-t border-ink/10 pt-10">
            <h2 className="font-display text-lg text-ink">{t("description")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-stone">
              {productDescription(product, locale)}
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 border-t border-ink/10 pt-16">
          <h2 className="font-display text-2xl text-ink">{t("youMayLike")}</h2>
          <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {related.map((p, i) => (
              <li key={p.id}>
                <ProductCard product={p} index={i} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
