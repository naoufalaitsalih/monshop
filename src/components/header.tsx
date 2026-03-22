"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "./language-switcher";
import { useCart } from "@/context/cart-context";
import { motion } from "framer-motion";

export function Header() {
  const t = useTranslations("nav");
  const { itemCount } = useCart();

  const links = [
    { href: "/", label: t("home") },
    { href: "/shop", label: t("shop") },
    { href: "/contact", label: t("contact") },
  ] as const;

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b border-ink/5 bg-[var(--background)]/90 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="font-display text-xl tracking-tight text-ink sm:text-2xl"
        >
          Maison Moda
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-stone transition-colors hover:text-ink"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/cart"
            className="relative flex h-10 min-w-10 items-center justify-center rounded-full border border-ink/10 bg-white px-3 text-sm font-medium text-ink transition hover:border-accent/40 hover:bg-sand"
          >
            {t("cart")}
            {itemCount > 0 && (
              <span className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
      <nav
        className="flex border-t border-ink/5 px-4 py-2 md:hidden"
        aria-label="Mobile"
      >
        <div className="mx-auto flex w-full max-w-6xl justify-around gap-2">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs font-medium text-stone hover:text-ink"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </motion.header>
  );
}
