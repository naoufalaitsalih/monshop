import { getTranslations } from "next-intl/server";
import { Hero } from "@/components/hero";
import { ProductCard } from "@/components/product-card";
import { products } from "@/data/products";
import { Link } from "@/i18n/routing";

export default async function HomePage() {
  const t = await getTranslations("home");
  const featured = products.slice(0, 3);

  const values = [
    { title: t("value1Title"), text: t("value1Text") },
    { title: t("value2Title"), text: t("value2Text") },
    { title: t("value3Title"), text: t("value3Text") },
  ];

  return (
    <>
      <Hero />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <section>
          <h2 className="font-display text-2xl text-ink sm:text-3xl">
            {t("featured")}
          </h2>
          <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {featured.map((product, i) => (
              <li key={product.id}>
                <ProductCard product={product} index={i} />
              </li>
            ))}
          </ul>
          <div className="mt-10 flex justify-center">
            <Link
              href="/shop"
              className="rounded-full border border-ink/15 px-8 py-3 text-sm font-semibold text-ink transition hover:bg-sand"
            >
              {t("ctaShop")}
            </Link>
          </div>
        </section>

        <section className="mt-20">
          <h2 className="font-display text-2xl text-ink sm:text-3xl">
            {t("valuesTitle")}
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {values.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-ink/5 bg-white p-6 shadow-sm"
              >
                <p className="font-display text-lg text-ink">{item.title}</p>
                <p className="mt-2 text-sm text-stone">{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
