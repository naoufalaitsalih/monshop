"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/routing";
import { products } from "@/data/products";
import { useCart } from "@/context/cart-context";
import { productName } from "@/lib/product-labels";

export function CartView() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const { lines, removeLine, setQuantity } = useCart();

  const rows = lines
    .map((line) => {
      const product = products.find((p) => p.id === line.productId);
      if (!product) return null;
      return { line, product };
    })
    .filter(Boolean) as { line: (typeof lines)[0]; product: (typeof products)[0] }[];

  const subtotal = rows.reduce(
    (sum, { line, product }) => sum + product.priceMad * line.quantity,
    0
  );

  if (rows.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-stone">{t("empty")}</p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-ink px-8 py-3 text-sm font-semibold text-white hover:bg-ink/90"
        >
          {t("continue")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr,320px] lg:items-start">
      <ul className="space-y-4">
        <AnimatePresence mode="popLayout">
          {rows.map(({ line, product }) => (
            <motion.li
              key={`${line.productId}-${line.size}`}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-4 rounded-2xl border border-ink/5 bg-white p-4 shadow-sm"
            >
              <Link
                href={`/shop/${product.slug}`}
                className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-sand sm:h-32 sm:w-28"
              >
                <Image
                  src={product.image}
                  alt={productName(product, locale)}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <Link href={`/shop/${product.slug}`}>
                  <span className="font-medium text-ink hover:text-accent">
                    {productName(product, locale)}
                  </span>
                </Link>
                <p className="text-sm text-stone">
                  {line.size} · {product.priceMad} MAD {t("each")}
                </p>
                <div className="mt-auto flex flex-wrap items-center gap-3 pt-3">
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={line.quantity}
                    onChange={(e) =>
                      setQuantity(
                        line.productId,
                        line.size,
                        Number(e.target.value) || 1
                      )
                    }
                    className="w-16 rounded-lg border border-ink/10 px-2 py-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeLine(line.productId, line.size)}
                    className="text-sm text-stone underline-offset-2 hover:text-ink hover:underline"
                  >
                    {t("remove")}
                  </button>
                </div>
              </div>
              <p className="shrink-0 text-sm font-semibold text-ink">
                {product.priceMad * line.quantity} MAD
              </p>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <aside className="rounded-2xl border border-ink/5 bg-white p-6 shadow-sm lg:sticky lg:top-28">
        <p className="text-sm text-stone">{t("subtotal")}</p>
        <p className="mt-1 font-display text-2xl text-ink">{subtotal} MAD</p>
        <Link
          href="/checkout"
          className="mt-6 flex w-full items-center justify-center rounded-full bg-ink py-3.5 text-sm font-semibold text-white transition hover:bg-ink/90"
        >
          {t("checkout")}
        </Link>
        <Link
          href="/shop"
          className="mt-3 block text-center text-sm text-stone hover:text-ink"
        >
          {t("continue")}
        </Link>
      </aside>
    </div>
  );
}
