"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { Link } from "@/i18n/routing";
import type { Product } from "@/data/products";
import { useCart } from "@/context/cart-context";
import { useProductsCatalog } from "@/context/products-context";
import { productName } from "@/lib/product-labels";
import { productImageUnoptimized } from "@/lib/product-image";
import { ProductBadges } from "@/components/product-badges";
import { ProductPrice } from "@/components/product-price";

const FEATURED_IDS = ["1", "3", "5", "15"];

export function FeaturedProductsHome() {
  const t = useTranslations("home");
  const ts = useTranslations("shop");
  const locale = useLocale();
  const { addItem } = useCart();
  const { products: catalog } = useProductsCatalog();

  const list = useMemo(() => {
    const byId = FEATURED_IDS.map((id) => catalog.find((p) => p.id === id)).filter(
      Boolean
    ) as Product[];
    if (byId.length >= 4) return byId.slice(0, 4);
    const needed = 4 - byId.length;
    const used = new Set(byId.map((p) => p.id));
    const others = catalog.filter((p) => !used.has(p.id));
    return [...byId, ...others.slice(-needed)];
  }, [catalog]);

  const handleAdd = (product: Product) => {
    const size = product.sizes[0] ?? "TU";
    addItem(product, 1, size);
  };

  return (
    <section className="mt-20 sm:mt-28" aria-labelledby="featured-heading">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
      >
        <div>
          <h2
            id="featured-heading"
            className="font-display text-2xl text-ink sm:text-3xl md:text-4xl"
          >
            {t("featuredTitle")}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-stone sm:text-base">
            {t("featuredSubtitle")}
          </p>
        </div>
        <Link
          href="/shop"
          className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
        >
          {t("featuredSeeAll")}
        </Link>
      </motion.div>
      <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((product, i) => (
          <motion.li
            key={product.id}
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-sm transition-shadow hover:shadow-lg"
          >
            <Link
              href={`/shop/${product.slug}`}
              className="relative aspect-[3/4] overflow-hidden bg-sand"
            >
              <ProductBadges product={product} />
              <Image
                src={product.image}
                alt={productName(product, locale)}
                fill
                className="object-cover transition duration-500 hover:scale-[1.04]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                unoptimized={productImageUnoptimized(product.image)}
              />
            </Link>
            <div className="flex flex-1 flex-col p-4">
              <Link href={`/shop/${product.slug}`}>
                <h3 className="font-display text-base leading-snug text-ink hover:text-accent">
                  {productName(product, locale)}
                </h3>
              </Link>
              <div className="mt-2">
                <ProductPrice product={product} size="sm" />
              </div>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAdd(product)}
                className="mt-4 w-full rounded-full bg-ink py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-ink/90 sm:text-sm"
              >
                {ts("addToCart")}
              </motion.button>
              <Link
                href={`/shop/${product.slug}`}
                className="mt-2 text-center text-xs font-medium text-stone underline-offset-2 hover:text-ink hover:underline"
              >
                {ts("viewProduct")}
              </Link>
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
