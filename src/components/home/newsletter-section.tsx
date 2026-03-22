"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

export function NewsletterSection() {
  const t = useTranslations("home");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
  };

  return (
    <section
      className="mt-20 sm:mt-28"
      aria-labelledby="newsletter-heading"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-ink/5 bg-ink px-5 py-12 text-center text-white shadow-xl sm:rounded-3xl sm:px-10 sm:py-14"
      >
        <div className="pointer-events-none absolute -end-24 -top-24 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -start-20 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
        <h2
          id="newsletter-heading"
          className="relative font-display text-2xl sm:text-3xl md:text-4xl"
        >
          {t("newsletterTitle")}
        </h2>
        <p className="relative mx-auto mt-3 max-w-lg text-sm text-white/75 sm:text-base">
          {t("newsletterSubtitle")}
        </p>
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.p
              key="thanks"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="relative mt-8 text-sm font-medium text-accent"
            >
              {t("newsletterThanks")}
            </motion.p>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="relative mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row sm:gap-2"
            >
              <label htmlFor="home-newsletter-email" className="sr-only">
                {t("newsletterPlaceholder")}
              </label>
              <input
                id="home-newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("newsletterPlaceholder")}
                required
                className="min-h-12 flex-1 rounded-full border border-white/20 bg-white/10 px-5 text-sm text-white placeholder:text-white/45 backdrop-blur-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="min-h-12 rounded-full bg-accent px-8 text-sm font-bold text-ink shadow-lg shadow-accent/20"
              >
                {t("newsletterCta")}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
        <p className="relative mt-4 text-[11px] text-white/45">
          {t("newsletterDisclaimer")}
        </p>
      </motion.div>
    </section>
  );
}
