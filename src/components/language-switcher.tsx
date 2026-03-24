"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";

const locales = [
  { code: "fr", label: "FR" },
  { code: "ar", label: "عربي" },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2 sm:gap-2.5">
      <span className="hidden text-[10px] font-semibold uppercase tracking-wider text-stone dark:text-zinc-500 sm:inline">
        {t("language")}
      </span>
      <div
        className="flex rounded-full border border-accent/25 bg-white p-0.5 text-xs font-semibold shadow-sm ring-1 ring-ink/5 backdrop-blur-sm dark:border-zinc-600 dark:bg-zinc-800 dark:ring-zinc-600/40"
        role="group"
        aria-label={t("language")}
      >
        {locales.map(({ code, label }) => (
          <button
            key={code}
            type="button"
            onClick={() => router.replace(pathname, { locale: code })}
            className={`rounded-full px-3 py-1.5 transition-all duration-200 ${
              locale === code
                ? "bg-ink text-white shadow-md dark:bg-accent dark:text-ink"
                : "text-stone hover:bg-sand/90 hover:text-ink dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
