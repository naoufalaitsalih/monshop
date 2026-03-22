"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";

const locales = [
  { code: "fr", label: "FR" },
  { code: "ar", label: "عربي" },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div
      className="flex rounded-full border border-ink/10 bg-white/80 p-0.5 text-xs font-medium backdrop-blur-sm"
      role="group"
      aria-label="Language"
    >
      {locales.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => router.replace(pathname, { locale: code })}
          className={`rounded-full px-3 py-1 transition-colors ${
            locale === code
              ? "bg-ink text-white"
              : "text-stone hover:text-ink"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
