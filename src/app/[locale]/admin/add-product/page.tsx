"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { ProductForm } from "@/components/admin/product-form";
import { useProductsCatalog } from "@/context/products-context";
import { useAdminToast } from "@/context/admin-toast-context";

export default function AdminAddProductPage() {
  const t = useTranslations("admin");
  const router = useRouter();
  const { addProduct, products, hydrated } = useProductsCatalog();
  const { pushToast } = useAdminToast();

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-zinc-200" />
        <div className="h-96 animate-pulse rounded-2xl bg-zinc-200" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink">{t("addProductTitle")}</h1>
        <p className="mt-2 text-sm text-stone">{t("addProductSubtitle")}</p>
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <ProductForm
          mode="create"
          submitLabel={t("formSubmitAdd")}
          catalogForPack={products}
          onSubmit={(draft) => {
            addProduct(draft);
            pushToast(t("toastProductAdded"), "success");
            if (draft.isPack) {
              pushToast(t("toastPackCreated"), "success");
            }
            router.push("/admin/products");
          }}
        />
      </div>
    </div>
  );
}
