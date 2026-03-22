import { getTranslations } from "next-intl/server";
import { CheckoutForm } from "@/components/checkout-form";

export default async function CheckoutPage() {
  const t = await getTranslations("checkout");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-3xl text-ink sm:text-4xl">{t("title")}</h1>
      <p className="mt-2 text-stone">{t("subtitle")}</p>
      <div className="mt-10">
        <CheckoutForm />
      </div>
    </div>
  );
}
