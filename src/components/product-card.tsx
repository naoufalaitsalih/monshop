"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import type { Product } from "@/data/products";
import { productName, productShortDescription } from "@/lib/product-labels";
import { ProductBadges } from "./product-badges";
import { ProductPrice } from "./product-price";

type Props = {
  product: Product;
  index?: number;
};

export function ProductCard({ product, index = 0 }: Props) {
  const locale = useLocale();
  const t = useTranslations("shop");

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      viewport={{ once: true, margin: "-32px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-sm ring-1 ring-transparent transition-[box-shadow,ring] duration-300 hover:shadow-xl hover:ring-accent/15"
    >
      <Link
        href={`/shop/${product.slug}`}
        className="relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-sand to-sand/60"
      >
        <ProductBadges product={product} />
        <Image
          src={product.image}
          alt={productName(product, locale)}
          fill
          className="object-cover transition duration-700 ease-out group-hover:scale-[1.05]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/25 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
      </Link>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-display text-lg leading-snug text-ink transition-colors group-hover:text-accent">
            {productName(product, locale)}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-stone sm:text-sm">
          {productShortDescription(product, locale)}
        </p>
        <div className="mt-3">
          <ProductPrice product={product} size="sm" />
        </div>
        <Link
          href={`/shop/${product.slug}`}
          className="mt-auto pt-4 text-sm font-semibold text-ink underline-offset-4 transition hover:text-accent hover:underline"
        >
          {t("viewProduct")}
        </Link>
      </div>
    </motion.article>
  );
}
