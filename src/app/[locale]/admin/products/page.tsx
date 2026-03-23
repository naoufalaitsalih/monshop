"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useProductsCatalog } from "@/context/products-context";
import { useAdminToast } from "@/context/admin-toast-context";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { productImageUnoptimized } from "@/lib/product-image";

export default function AdminProductsPage() {
  const t = useTranslations("admin");
  const tc = useTranslations("categories");
  const { products, hydrated, removeProduct } = useProductsCatalog();
  const { pushToast } = useAdminToast();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleConfirmDelete = () => {
    if (!pendingId) return;
    removeProduct(pendingId);
    pushToast(t("toastProductDeleted"), "success");
    setPendingId(null);
  };

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-zinc-200" />
        <div className="h-64 animate-pulse rounded-2xl bg-zinc-200" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">{t("productsTitle")}</h1>
          <p className="mt-2 text-sm text-stone">
            {t("productsCount", { count: products.length })}
          </p>
        </div>
        <Link
          href="/admin/add-product"
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-ink transition hover:bg-accent/90"
        >
          {t("addProduct")}
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-stone">
              <tr>
                <th className="px-4 py-3">{t("colImage")}</th>
                <th className="px-4 py-3">{t("colNameFr")}</th>
                <th className="px-4 py-3">{t("colNameAr")}</th>
                <th className="px-4 py-3">{t("colPrice")}</th>
                <th className="px-4 py-3">{t("colCategory")}</th>
                <th className="px-4 py-3 text-end">{t("colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {products.map((p) => (
                <tr key={p.id} className="text-ink">
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-zinc-100">
                      <Image
                        src={p.image}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="48px"
                        unoptimized={productImageUnoptimized(p.image)}
                      />
                    </div>
                  </td>
                  <td className="max-w-[180px] px-4 py-3">
                    <span className="line-clamp-2 font-medium">{p.nameFr}</span>
                    {p.isPack ? (
                      <span className="mt-1 inline-block rounded bg-accent/25 px-2 py-0.5 text-[10px] font-bold uppercase text-ink">
                        {t("badgePack")}
                      </span>
                    ) : null}
                  </td>
                  <td className="max-w-[160px] px-4 py-3">
                    <span className="line-clamp-2" dir="rtl">
                      {p.nameAr}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium">
                    {p.priceMad} MAD
                  </td>
                  <td className="px-4 py-3 text-stone">{tc(p.category)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link
                        href={`/admin/edit-product/${p.id}`}
                        className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-semibold transition hover:bg-zinc-50"
                        title={t("edit")}
                      >
                        <span aria-hidden>✏️</span>
                        <span className="ms-1.5 max-sm:sr-only">{t("edit")}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setPendingId(p.id)}
                        className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                        title={t("delete")}
                      >
                        <span aria-hidden>❌</span>
                        <span className="ms-1.5 max-sm:sr-only">{t("delete")}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={pendingId !== null}
        title={t("deleteTitle")}
        message={t("deleteMessage")}
        confirmLabel={t("confirmDelete")}
        cancelLabel={t("cancel")}
        onCancel={() => setPendingId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
