"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const ITEMS = [
  {
    quoteKey: "testimonial1Quote" as const,
    authorKey: "testimonial1Author" as const,
    cityKey: "testimonial1City" as const,
  },
  {
    quoteKey: "testimonial2Quote" as const,
    authorKey: "testimonial2Author" as const,
    cityKey: "testimonial2City" as const,
  },
  {
    quoteKey: "testimonial3Quote" as const,
    authorKey: "testimonial3Author" as const,
    cityKey: "testimonial3City" as const,
  },
] as const;

export function TestimonialsSection() {
  const t = useTranslations("home");

  return (
    <section className="mt-20 sm:mt-28" aria-labelledby="testimonials-heading">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.45 }}
        className="text-center"
      >
        <h2
          id="testimonials-heading"
          className="font-display text-2xl text-ink sm:text-3xl md:text-4xl"
        >
          {t("testimonialsTitle")}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-stone sm:text-base">
          {t("testimonialsSubtitle")}
        </p>
      </motion.div>
      <ul className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {ITEMS.map((item, i) => (
          <motion.li
            key={item.quoteKey}
            initial={{ opacity: 0, y: 28, x: i % 2 === 0 ? -8 : 8 }}
            whileInView={{ opacity: 1, y: 0, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.55,
              delay: i * 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="rounded-2xl border border-ink/5 bg-gradient-to-b from-white to-sand/40 p-6 shadow-sm"
          >
            <p className="font-display text-4xl leading-none text-accent/80">
              “
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink sm:text-base">
              {t(item.quoteKey)}
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-stone">
              {t(item.authorKey)}
            </p>
            <p className="mt-1 text-xs text-stone/90">{t(item.cityKey)}</p>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
