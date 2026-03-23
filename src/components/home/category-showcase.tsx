"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import type { Category } from "@/data/products";

const CATEGORIES: {
  key: Category;
  image: string;
}[] = [
  {
    key: "sandals",
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=900&q=85",
  },
  {
    key: "bags",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900&q=85",
  },
  {
    key: "sunglasses",
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=900&q=85",
  },
  {
    key: "dresses",
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&q=85",
  },
  {
    key: "pack",
    image:
      "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=900&q=85",
  },
];

export function CategoryShowcase() {
  const t = useTranslations("home");
  const tc = useTranslations("categories");

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
      <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 lg:gap-6">
        {CATEGORIES.map((item, i) => (
          <motion.li
            key={item.key}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <Link
              href={`/shop?category=${item.key}`}
              className="group block overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-md ring-1 ring-transparent transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-accent/20"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-sand">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  className="object-cover transition duration-700 ease-out group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent opacity-90" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="font-display text-xl sm:text-2xl">
                    {tc(item.key)}
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
    </section>
  );
}
