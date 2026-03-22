"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/routing";
import { useCart } from "@/context/cart-context";
import { useProductsCatalog } from "@/context/products-context";
import { useOrders } from "@/context/orders-context";
import type { OrderLineItem } from "@/context/orders-context";

export function CheckoutForm() {
  const t = useTranslations("checkout");
  const tNav = useTranslations("nav");
  const { lines, clear } = useCart();
  const { getById } = useProductsCatalog();
  const { addOrder } = useOrders();
  const [done, setDone] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const subtotal = lines.reduce((sum, line) => {
    const p = getById(line.productId);
    return sum + (p ? p.priceMad * line.quantity : 0);
  }, 0);

  useEffect(() => {
    if (!flash) return;
    const id = window.setTimeout(() => setFlash(null), 4500);
    return () => window.clearTimeout(id);
  }, [flash]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const items: OrderLineItem[] = [];
    for (const line of lines) {
      const p = getById(line.productId);
      if (!p) continue;
      const unit = p.priceMad;
      items.push({
        productId: p.id,
        slug: p.slug,
        nameFr: p.nameFr,
        nameAr: p.nameAr,
        quantity: line.quantity,
        size: line.size,
        unitPriceMad: unit,
        lineTotalMad: unit * line.quantity,
      });
    }

    if (items.length === 0) {
      setFlash("Panier invalide — rechargez la page.");
      return;
    }

    addOrder({
      customerName: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim() || undefined,
      address: String(fd.get("address") ?? "").trim(),
      city: String(fd.get("city") ?? "").trim() || undefined,
      items,
      total: subtotal,
    });

    clear();
    setDone(true);
    setFlash("Commande enregistrée ! Retrouvez-la dans l’admin.");
  };

  if (lines.length === 0 && !done) {
    return (
      <p className="text-stone">
        <Link href="/cart" className="font-medium text-ink underline">
          {tNav("cart")}
        </Link>
        {" · "}
        <Link href="/shop" className="text-ink underline">
          {tNav("shop")}
        </Link>
      </p>
    );
  }

  return (
    <div className="relative grid gap-10 lg:grid-cols-[1fr,280px]">
      {flash ? (
        <div
          className="fixed bottom-6 start-1/2 z-50 w-[min(100%-2rem,24rem)] -translate-x-1/2 rounded-xl border border-accent/40 bg-white px-4 py-3 text-center text-sm font-medium text-ink shadow-lg lg:start-auto lg:end-6 lg:translate-x-0"
          role="status"
        >
          {flash}
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-accent/30 bg-sand/50 p-8"
          >
            <p className="font-display text-xl text-ink">{t("success")}</p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-full bg-ink px-8 py-3 text-sm font-semibold text-white"
            >
              {t("backHome")}
            </Link>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {[
              { id: "name", name: "fullName", type: "text" },
              { id: "email", name: "email", type: "email" },
              { id: "phone", name: "phone", type: "tel" },
              { id: "address", name: "address", type: "text" },
              { id: "city", name: "city", type: "text" },
            ].map((field) => (
              <div key={field.id}>
                <label
                  htmlFor={field.id}
                  className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone"
                >
                  {t(field.name as "fullName")}
                </label>
                <input
                  id={field.id}
                  name={field.id}
                  type={field.type}
                  required={field.id !== "phone"}
                  className="w-full rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
            ))}
            <button
              type="submit"
              className="w-full rounded-full bg-ink py-3.5 text-sm font-semibold text-white transition hover:bg-ink/90 lg:w-auto lg:px-12"
            >
              {t("placeOrder")}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {!done && lines.length > 0 && (
        <aside className="rounded-2xl border border-ink/5 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone">
            {t("orderTotal")}
          </p>
          <p className="mt-1 font-display text-2xl text-ink">{subtotal} MAD</p>
        </aside>
      )}
    </div>
  );
}
