"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { useShopCategories } from "@/context/categories-context";
import { productImageUnoptimized } from "@/lib/product-image";

export function CategoryShowcase() {
  const t = useTranslations("home");
  const locale = useLocale();
  const { categories } = useShopCategories();

  return (
    <section className="mt-16 sm:mt-24" aria-labelledby="categories-heading">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2
          id="categories-heading"
          className="font-display text-2xl text-ink sm:text-3xl md:text-4xl"
        >
          {t("categoriesTitle")}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-stone sm:text-base">
          {t("categoriesSubtitle")}
        </p>
      </motion.div>
      {categories.length === 0 ? (
        <p className="mt-10 text-center text-sm text-stone">
          {t("categoriesEmpty")}
        </p>
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
          {categories.map((item, i) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <Link
                href={`/shop?category=${encodeURIComponent(item.id)}`}
                className="group block overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-md ring-1 ring-transparent transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-accent/20"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-sand">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    className="object-cover transition duration-700 ease-out group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    unoptimized={productImageUnoptimized(item.image)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent opacity-90" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <p className="font-display text-xl sm:text-2xl">
                      {locale === "ar" ? item.nameAr : item.nameFr}
                    </p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-accent">
                      {t("categoryCta")}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </section>
  );
}
