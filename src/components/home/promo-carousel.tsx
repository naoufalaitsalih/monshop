"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@/i18n/routing";

const SLIDES = [
  {
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=85",
    lineKey: "promoSlide1Line" as const,
  },
  {
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=85",
    lineKey: "promoSlide2Line" as const,
  },
  {
    image:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=85",
    lineKey: "promoSlide3Line" as const,
  },
] as const;

export function PromoCarousel() {
  const t = useTranslations("home");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((p) => (p + 1) % SLIDES.length);
    }, 5200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      className="mt-20 sm:mt-28"
      aria-labelledby="promo-heading"
    >
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-4xl text-center"
      >
        <h2
          id="promo-heading"
          className="font-display text-2xl leading-tight text-ink sm:text-3xl md:text-4xl"
        >
          {t("promoBannerTitle")}
        </h2>
        <p className="mt-3 text-sm text-stone sm:text-base">
          {t("promoBannerSubtitle")}
        </p>
      </motion.div>

      <div className="relative mx-auto mt-10 max-w-6xl">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-ink/5 bg-ink shadow-xl sm:aspect-[21/9] sm:rounded-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={SLIDES[index].image}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1152px"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-4 pb-8 pt-16 text-center text-white sm:pb-12">
                <p className="max-w-xl font-display text-xl sm:text-2xl md:text-3xl text-balance">
                  {t(SLIDES[index].lineKey)}
                </p>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6"
                >
                  <Link
                    href="/shop"
                    className="inline-flex rounded-full bg-accent px-8 py-3 text-sm font-bold text-ink shadow-lg"
                  >
                    {t("promoCta")}
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div
          className="mt-4 flex justify-center gap-2"
          role="tablist"
          aria-label={t("promoDotsLabel")}
        >
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index
                  ? "w-8 bg-accent"
                  : "w-2 bg-ink/20 hover:bg-ink/35"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
