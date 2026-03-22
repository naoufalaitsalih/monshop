"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export function ValuesSection() {
  const t = useTranslations("home");

  const values = [
    { title: t("value1Title"), text: t("value1Text") },
    { title: t("value2Title"), text: t("value2Text") },
    { title: t("value3Title"), text: t("value3Text") },
  ];

  return (
    <section className="mt-20 sm:mt-28" aria-labelledby="values-heading">
      <motion.h2
        id="values-heading"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-2xl text-ink sm:text-3xl md:text-4xl"
      >
        {t("valuesTitle")}
      </motion.h2>
      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {values.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            className="rounded-2xl border border-ink/5 bg-white p-6 shadow-sm ring-1 ring-ink/[0.02]"
          >
            <p className="font-display text-lg text-ink">{item.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-stone">{item.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
