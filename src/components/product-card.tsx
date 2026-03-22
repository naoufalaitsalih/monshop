"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import type { Product } from "@/data/products";
import { productName } from "@/lib/product-labels";

type Props = {
  product: Product;
  index?: number;
};

export function ProductCard({ product, index = 0 }: Props) {
  const locale = useLocale();
  const t = useTranslations("shop");

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <Link href={`/shop/${product.slug}`} className="relative aspect-[3/4] overflow-hidden bg-sand">
        <Image
          src={product.image}
          alt={productName(product, locale)}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-display text-lg text-ink group-hover:text-accent transition-colors">
            {productName(product, locale)}
          </h3>
        </Link>
        <p className="mt-1 text-sm text-stone">
          {product.priceMad} MAD
        </p>
        <Link
          href={`/shop/${product.slug}`}
          className="mt-auto pt-4 text-sm font-medium text-ink underline-offset-4 hover:underline"
        >
          {t("viewProduct")}
        </Link>
      </div>
    </motion.article>
  );
}
