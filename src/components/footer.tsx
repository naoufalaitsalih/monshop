import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

export async function Footer() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");

  const social = [
    {
      href: "https://www.instagram.com",
      label: t("socialInstagram"),
      aria: t("socialInstagramAria"),
    },
    {
      href: "https://www.tiktok.com",
      label: t("socialTiktok"),
      aria: t("socialTiktokAria"),
    },
    {
      href: "https://www.facebook.com",
      label: t("socialFacebook"),
      aria: t("socialFacebookAria"),
    },
  ] as const;

  return (
    <footer className="mt-24 border-t border-white/10 bg-ink text-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <p className="font-display text-2xl tracking-tight">Maison Moda</p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-sand/80">
              {t("tagline")}
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/55">
              {t("companyBlurb")}
            </p>
          </div>
          <div className="lg:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {t("quickLinks")}
            </p>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-white/75">
              <li>
                <Link href="/" className="transition hover:text-white">
                  {nav("home")}
                </Link>
              </li>
              <li>
                <Link href="/shop" className="transition hover:text-white">
                  {nav("shop")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition hover:text-white">
                  {nav("contact")}
                </Link>
              </li>
              <li>
                <Link href="/cart" className="transition hover:text-white">
                  {nav("cart")}
                </Link>
              </li>
            </ul>
          </div>
          <div className="lg:col-span-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {t("followUs")}
            </p>
            <ul className="mt-4 flex flex-wrap gap-4">
              {social.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-white/80 underline-offset-4 transition hover:text-white hover:underline"
                    aria-label={item.aria}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-xs leading-relaxed text-white/40">
              {t("socialNote")}
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-3 text-center text-[11px] leading-relaxed text-white/45 sm:px-6">
        {t("trustLine")}
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Maison Moda — {t("rights")}
      </div>
    </footer>
  );
}
