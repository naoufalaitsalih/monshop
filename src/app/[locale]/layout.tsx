import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale, getTranslations } from "next-intl/server";
import { DM_Sans, Noto_Sans_Arabic, Playfair_Display } from "next/font/google";
import { routing } from "@/i18n/routing";
import { ProductsProvider } from "@/context/products-context";
import { OrdersProvider } from "@/context/orders-context";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});

const sansFr = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const sansAr = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "fr" | "ar")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const bodyFont = locale === "ar" ? sansAr : sansFr;

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${display.variable} ${bodyFont.variable}`}
    >
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <ProductsProvider>
            <OrdersProvider>{children}</OrdersProvider>
          </ProductsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
