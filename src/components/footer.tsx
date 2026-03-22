import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

export async function Footer() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");

  return (
    <footer className="mt-24 border-t border-ink/10 bg-ink text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div>
          <p className="font-display text-xl">Maison Moda</p>
          <p className="mt-2 max-w-xs text-sm text-white/60">{t("tagline")}</p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-white/80">
          <Link href="/shop" className="hover:text-white">
            {nav("shop")}
          </Link>
          <Link href="/contact" className="hover:text-white">
            {nav("contact")}
          </Link>
          <Link href="/cart" className="hover:text-white">
            {nav("cart")}
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Maison Moda — {t("rights")}
      </div>
    </footer>
  );
}
