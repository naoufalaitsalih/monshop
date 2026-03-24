import { getTranslations } from "next-intl/server";
import { AdminShell } from "@/components/admin/admin-shell";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin.metadata" });
  return {
    title: t("title"),
    robots: { index: false, follow: false },
  };
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
