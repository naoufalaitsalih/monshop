"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import Image from "next/image";

export function HeroHome() {
  const t = useTranslations("home");

  return (
    <section className="relative overflow-hidden rounded-2xl bg-ink text-white sm:rounded-3xl">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1920&q=85"
          alt=""
          fill
          className="object-cover object-top sm:object-center opacity-50"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-ink/40" />
      </div>
      <div className="relative mx-auto flex min-h-[min(88vh,760px)] max-w-6xl flex-col justify-end px-4 pb-14 pt-28 sm:px-6 sm:pb-20 sm:pt-36">
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="font-display max-w-3xl text-3xl leading-[1.15] text-balance sm:text-5xl md:text-6xl"
        >
          {t("heroTitle")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base"
        >
          {t("heroSubtitle")}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-wrap gap-3 sm:gap-4"
        >
          <motion.div
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
          >
            <Link
              href="/shop"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-10 py-3.5 text-sm font-bold tracking-wide text-ink shadow-lg shadow-accent/25 transition-colors hover:bg-white"
            >
              {t("ctaDiscover")}
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/35 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-white/10"
            >
              {t("ctaContact")}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
