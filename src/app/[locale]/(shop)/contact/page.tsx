import { getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/contact-form";

export default async function ContactPage() {
  const t = await getTranslations("contact");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="grid gap-12 lg:grid-cols-[1fr,320px] lg:items-start">
        <div>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">{t("title")}</h1>
          <p className="mt-3 max-w-lg text-stone">{t("subtitle")}</p>
          <div className="mt-10 max-w-xl">
            <ContactForm />
          </div>
        </div>
        <aside className="rounded-2xl border border-ink/5 bg-ink p-8 text-white">
          <h2 className="font-display text-lg">{t("infoTitle")}</h2>
          <p className="mt-4 text-sm text-white/70">{t("location")}</p>
          <p className="mt-2 text-sm text-white/70">{t("hours")}</p>
          <p className="mt-6 text-sm text-white/50">hello@maisonmoda.ma</p>
        </aside>
      </div>
    </div>
  );
}
