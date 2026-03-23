import { getTranslations } from "next-intl/server";
import { CartView } from "@/components/cart-view";

export default async function CartPage() {
  const t = await getTranslations("cart");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-3xl text-ink sm:text-4xl">{t("title")}</h1>
      <div className="mt-10">
        <CartView />
      </div>
    </div>
  );
}
