import type { Metadata } from "next";
import "@/app/globals.css";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { ProductsProvider } from "@/context/products-context";
import { AdminToastProvider } from "@/context/admin-toast-context";
import { AdminShell } from "@/components/admin/admin-shell";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Admin · Maison Moda",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans text-ink antialiased">
        <ProductsProvider>
          <AdminToastProvider>
            <AdminShell>{children}</AdminShell>
          </AdminToastProvider>
        </ProductsProvider>
      </body>
    </html>
  );
}
