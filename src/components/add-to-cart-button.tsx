"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/data/products";
import { useCart } from "@/context/cart-context";

type Props = {
  product: Product;
  size: string;
  quantity: number;
  className?: string;
};

export function AddToCartButton({
  product,
  size,
  quantity,
  className = "",
}: Props) {
  const t = useTranslations("shop");
  const { addItem } = useCart();
  const [flash, setFlash] = useState(false);

  const disabled = !size;

  const handleClick = () => {
    if (disabled) return;
    addItem(product, quantity, size);
    setFlash(true);
    window.setTimeout(() => setFlash(false), 1600);
  };

  return (
    <div className="relative">
      <motion.button
        type="button"
        disabled={disabled}
        onClick={handleClick}
        whileTap={{ scale: 0.98 }}
        className={`w-full rounded-full bg-ink py-3.5 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      >
        {t("addToCart")}
      </motion.button>
      <AnimatePresence>
        {flash && (
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute -top-9 start-0 text-xs font-medium text-accent"
          >
            ✓
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
