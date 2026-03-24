"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import type { ProductDraft } from "@/context/products-context";
import { useProductsCatalog } from "@/context/products-context";
import { useAdminToast } from "@/context/admin-toast-context";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ProductForm } from "@/components/admin/product-form";
import { productImageUnoptimized } from "@/lib/product-image";
import { productPrimaryImage } from "@/lib/product-media";
import { isPackProduct } from "@/data/products";
import { useShopCategories } from "@/context/categories-context";
import { RequireAdminAccess } from "@/components/admin/require-admin-access";
import { useAdminRbac } from "@/context/admin-rbac-context";

const PAGE_SIZE = 10;

type SortKey = "price_asc" | "price_desc" | "newest" | "oldest";

export default function AdminProductsPage() {
  return (
    <RequireAdminAccess permission="products.view">
      <AdminProductsPageContent />
    </RequireAdminAccess>
  );
}

function AdminProductsPageContent() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const { canAccess } = useAdminRbac();
  const { label: categoryLabel, categories: shopCategories } =
    useShopCategories();
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

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [listPage, setListPage] = useState(1);

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
    if (showForm && editingId && !canAccess("products.edit")) resetFormUi();
    if (showForm && !editingId && !canAccess("products.create")) resetFormUi();
  }, [showForm, editingId, canAccess, resetFormUi]);

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

  const indexById = useMemo(() => {
    const m = new Map<string, number>();
    products.forEach((p, i) => m.set(p.id, i));
    return m;
  }, [products]);

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = products;
    if (q) {
      list = list.filter(
        (p) =>
          p.nameFr.toLowerCase().includes(q) ||
          p.nameAr.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "all") {
      list = list.filter((p) => p.category === categoryFilter);
    }
    const sorted = [...list];
    switch (sortKey) {
      case "price_asc":
        sorted.sort((a, b) => a.priceMad - b.priceMad);
        break;
      case "price_desc":
        sorted.sort((a, b) => b.priceMad - a.priceMad);
        break;
      case "newest":
        sorted.sort(
          (a, b) => (indexById.get(b.id) ?? 0) - (indexById.get(a.id) ?? 0)
        );
        break;
      case "oldest":
        sorted.sort(
          (a, b) => (indexById.get(a.id) ?? 0) - (indexById.get(b.id) ?? 0)
        );
        break;
      default:
        break;
    }
    return sorted;
  }, [products, search, categoryFilter, sortKey, indexById]);

  useEffect(() => {
    setListPage(1);
  }, [search, categoryFilter, sortKey]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSorted.length / PAGE_SIZE)
  );
  const safePage = Math.min(listPage, totalPages);
  const paginated = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredSorted.slice(start, start + PAGE_SIZE);
  }, [filteredSorted, safePage]);

  useEffect(() => {
    if (listPage > totalPages) setListPage(totalPages);
  }, [listPage, totalPages]);

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
            {filteredSorted.length !== products.length ? (
              <span className="ms-2 font-medium text-ink">
                · {filteredSorted.length} / {products.length}
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!showForm && canAccess("products.create") ? (
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

      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-[min(100%,220px)] flex-1">
          <label
            htmlFor="admin-products-search"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone"
          >
            <span aria-hidden className="me-1">
              🔍
            </span>
            {t("productsSearchLabel")}
          </label>
          <input
            id="admin-products-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("productsSearchPlaceholder")}
            autoComplete="off"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-2.5 text-sm text-ink placeholder:text-stone/70 focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div className="min-w-[min(100%,200px)] sm:max-w-[220px]">
          <label
            htmlFor="admin-products-category"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone"
          >
            {t("productsFilterCategory")}
          </label>
          <select
            id="admin-products-category"
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(
                e.target.value === "all" ? "all" : e.target.value
              )
            }
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            <option value="all">{t("productsFilterAll")}</option>
            {shopCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {locale === "ar" ? c.nameAr : c.nameFr}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[min(100%,200px)] sm:max-w-[220px]">
          <label
            htmlFor="admin-products-sort"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone"
          >
            {t("productsSortLabel")}
          </label>
          <select
            id="admin-products-sort"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            <option value="price_asc">{t("productsSortPriceAsc")}</option>
            <option value="price_desc">{t("productsSortPriceDesc")}</option>
            <option value="newest">{t("productsSortNewest")}</option>
            <option value="oldest">{t("productsSortOldest")}</option>
          </select>
        </div>
      </div>

      {showForm &&
      ((editingId && canAccess("products.edit")) ||
        (!editingId && canAccess("products.create"))) ? (
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

      {filteredSorted.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/80 px-6 py-12 text-center text-sm text-stone">
          {t("productsNoResults")}
        </p>
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {paginated.map((p) => (
              <li
                key={p.id}
                className="group relative overflow-visible rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-lg motion-reduce:transition-none"
              >
                <div className="flex gap-4 p-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                    <Image
                      src={productPrimaryImage(p)}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="96px"
                      unoptimized={productImageUnoptimized(
                        productPrimaryImage(p)
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 font-medium text-ink">
                      {p.nameFr}
                    </p>
                    <p
                      className="mt-0.5 line-clamp-2 text-sm text-stone"
                      dir="rtl"
                    >
                      {p.nameAr}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-ink">
                      {p.priceMad} MAD
                    </p>
                    <p className="mt-0.5 text-xs text-stone">
                      {categoryLabel(p.category, locale)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {p.isNew === true ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-900">
                          {t("badgeNew")}
                        </span>
                      ) : null}
                      {p.isPromo === true && !isPackProduct(p) ? (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-900">
                          {t("badgePromo")}
                        </span>
                      ) : null}
                      {isPackProduct(p) ? (
                        <span className="rounded-full bg-accent/30 px-2 py-0.5 text-[10px] font-bold uppercase text-ink">
                          {t("badgePack")}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div
                  className="flex flex-wrap items-center justify-end gap-2 border-t border-zinc-100 px-3 py-2.5 sm:absolute sm:inset-x-0 sm:bottom-0 sm:translate-y-full sm:border-0 sm:bg-gradient-to-t sm:from-white sm:via-white/95 sm:to-transparent sm:px-4 sm:pb-3 sm:pt-8 sm:opacity-0 sm:transition-all sm:duration-200 sm:ease-out sm:group-hover:translate-y-0 sm:group-hover:opacity-100 motion-reduce:sm:translate-y-0 motion-reduce:sm:opacity-100"
                  aria-label={t("colActions")}
                >
                  <Link
                    href={`/shop/${p.slug}`}
                    className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-zinc-50"
                    title={t("productsViewShop")}
                  >
                    <span aria-hidden>👁️</span>
                    <span className="ms-1.5 max-sm:sr-only">
                      {t("productsViewShop")}
                    </span>
                  </Link>
                  {canAccess("products.edit") ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(p.id);
                        setFormKey((k) => k + 1);
                        setShowForm(true);
                        setFocusNameNonce((n) => n + 1);
                      }}
                      className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold transition hover:bg-zinc-50"
                      title={t("edit")}
                    >
                      <span aria-hidden>✏️</span>
                      <span className="ms-1.5 max-sm:sr-only">{t("edit")}</span>
                    </button>
                  ) : null}
                  {canAccess("products.delete") ? (
                    <button
                      type="button"
                      onClick={() => setPendingId(p.id)}
                      className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                      title={t("delete")}
                    >
                      <span aria-hidden>❌</span>
                      <span className="ms-1.5 max-sm:sr-only">{t("delete")}</span>
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>

          {totalPages > 1 ? (
            <div className="flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-6 sm:flex-row">
              <p className="text-center text-sm text-stone sm:text-start">
                {t("productsPageStatus", {
                  page: safePage,
                  total: totalPages,
                  count: filteredSorted.length,
                })}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setListPage((x) => Math.max(1, x - 1))}
                  className="rounded-full border border-zinc-300 bg-white px-5 py-2 text-sm font-semibold text-ink transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t("productsPagePrev")}
                </button>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() =>
                    setListPage((x) => Math.min(totalPages, x + 1))
                  }
                  className="rounded-full border border-zinc-300 bg-white px-5 py-2 text-sm font-semibold text-ink transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t("productsPageNext")}
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}

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
