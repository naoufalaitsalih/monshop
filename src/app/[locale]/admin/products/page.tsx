"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { ProductDraft } from "@/context/products-context";
import { useProductsCatalog } from "@/context/products-context";
import { useAdminToast } from "@/context/admin-toast-context";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ProductForm } from "@/components/admin/product-form";
import { productImageUnoptimized } from "@/lib/product-image";
import { productPrimaryImage } from "@/lib/product-media";
import { isPackProduct } from "@/data/products";
import { useShopCategories } from "@/context/categories-context";

export default function AdminProductsPage() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const { label: categoryLabel } = useShopCategories();
  const {
    products,
    hydrated,
    removeProduct,
    addProduct,
    updateProduct,
    getById,
  } = useProductsCatalog();
  const { pushToast } = useAdminToast();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [focusNameNonce, setFocusNameNonce] = useState(0);
  const [formAttention, setFormAttention] = useState(false);
  const formShellRef = useRef<HTMLDivElement>(null);

  const resetFormUi = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
    setFormKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (editingId && !products.some((p) => p.id === editingId)) {
      resetFormUi();
    }
  }, [editingId, products, resetFormUi]);

  useEffect(() => {
    if (!showForm || editingId == null) return;
    setFormAttention(true);
    const clearHighlight = window.setTimeout(() => setFormAttention(false), 2000);
    const frame = requestAnimationFrame(() => {
      formShellRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(clearHighlight);
    };
  }, [showForm, editingId, formKey]);

  const handleConfirmDelete = () => {
    if (!pendingId) return;
    removeProduct(pendingId);
    pushToast(t("toastProductDeleted"), "success");
    setPendingId(null);
    if (editingId === pendingId) resetFormUi();
  };

  const handleSubmit = (draft: ProductDraft) => {
    if (editingId) {
      const ok = updateProduct(editingId, draft);
      if (ok) {
        pushToast(t("toastProductUpdated"), "success");
        if (draft.category === "pack") pushToast(t("toastPackCreated"), "success");
        resetFormUi();
      } else {
        pushToast(t("toastUpdateFail"), "error");
      }
    } else {
      addProduct(draft);
      pushToast(t("toastProductAdded"), "success");
      if (draft.category === "pack") pushToast(t("toastPackCreated"), "success");
      resetFormUi();
    }
  };

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-zinc-200" />
        <div className="h-64 animate-pulse rounded-2xl bg-zinc-200" />
      </div>
    );
  }

  const editingProduct = editingId ? getById(editingId) : undefined;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">{t("productsTitle")}</h1>
          <p className="mt-2 text-sm text-stone">
            {t("productsCount", { count: products.length })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!showForm ? (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setFormKey((k) => k + 1);
                setShowForm(true);
              }}
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-ink transition hover:bg-accent/90"
            >
              {t("addProduct")}
            </button>
          ) : null}
        </div>
      </div>

      {showForm ? (
        <div
          ref={formShellRef}
          className={`scroll-mt-6 rounded-2xl border bg-white p-6 shadow-sm transition-[box-shadow,ring-color,border-color] duration-500 motion-reduce:transition-none ${
            formAttention && editingId
              ? "border-accent/50 shadow-lg shadow-accent/15 ring-2 ring-accent/35 ring-offset-2 ring-offset-white"
              : "border-zinc-200"
          }`}
        >
          <h2 className="font-display text-lg text-ink">
            {editingId
              ? t("editProductTitle")
              : t("addProductTitle")}
          </h2>
          <p className="mt-1 text-sm text-stone">
            {editingId ? t("editProductSubtitle") : t("addProductSubtitle")}
          </p>
          <div className="mt-6">
            <ProductForm
              key={`${formKey}-${editingId ?? "new"}`}
              mode={editingId ? "edit" : "create"}
              initial={editingProduct}
              submitLabel={
                editingId ? t("formSubmitUpdate") : t("formSubmitAdd")
              }
              onSubmit={handleSubmit}
              catalogForPack={products}
              excludeProductId={editingId ?? undefined}
              onCancel={resetFormUi}
              focusNameNonce={focusNameNonce}
            />
          </div>
        </div>
      ) : null}

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
                        src={productPrimaryImage(p)}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="48px"
                        unoptimized={productImageUnoptimized(
                          productPrimaryImage(p)
                        )}
                      />
                    </div>
                  </td>
                  <td className="max-w-[180px] px-4 py-3">
                    <span className="line-clamp-2 font-medium">{p.nameFr}</span>
                    {isPackProduct(p) ? (
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
                  <td className="px-4 py-3 text-stone">
                    {categoryLabel(p.category, locale)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(p.id);
                          setFormKey((k) => k + 1);
                          setShowForm(true);
                          setFocusNameNonce((n) => n + 1);
                        }}
                        className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-semibold transition hover:bg-zinc-50"
                        title={t("edit")}
                      >
                        <span aria-hidden>✏️</span>
                        <span className="ms-1.5 max-sm:sr-only">{t("edit")}</span>
                      </button>
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
