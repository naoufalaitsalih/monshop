"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function NotFound() {
  const t = useTranslations("nav");

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <p className="font-display text-4xl text-ink">404</p>
      <p className="mt-4 text-stone">Page introuvable / الصفحة غير موجودة</p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-ink px-8 py-3 text-sm font-semibold text-white"
      >
        {t("home")}
      </Link>
    </div>
  );
}
