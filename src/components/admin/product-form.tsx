"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import type { Category, Product } from "@/data/products";
import type { ProductDraft } from "@/context/products-context";
import { useAdminToast } from "@/context/admin-toast-context";
import { ADMIN_CATEGORY_OPTIONS } from "@/lib/admin-categories";
import { productImageUnoptimized } from "@/lib/product-image";
import { computePackSuggestedPriceMad } from "@/lib/pack-price";
import { productName } from "@/lib/product-labels";

type Props = {
  mode: "create" | "edit";
  initial?: Product;
  submitLabel: string;
  onSubmit: (draft: ProductDraft) => void;
  catalogForPack: Product[];
  excludeProductId?: string;
};

const emptyDraft: ProductDraft = {
  nameFr: "",
  nameAr: "",
  category: "sandals",
  priceMad: 0,
  image: "",
  descriptionFr: "",
  descriptionAr: "",
  isNew: false,
  isPromo: false,
  isPack: false,
  packItemIds: [],
  packDiscountPercent: 0,
};

function productToDraft(p: Product): ProductDraft {
  return {
    nameFr: p.nameFr,
    nameAr: p.nameAr,
    category: p.category,
    priceMad: p.priceMad,
    image: p.image,
    descriptionFr: p.shortDescriptionFr,
    descriptionAr: p.shortDescriptionAr,
    isNew: p.isNew === true,
    isPromo: p.isPromo === true,
    isPack: p.isPack === true,
    packItemIds: p.packItemIds ? [...p.packItemIds] : [],
    packDiscountPercent: p.packDiscountPercent ?? 0,
  };
}

type ImageSource = "url" | "file";

export function ProductForm({
  mode,
  initial,
  submitLabel,
  onSubmit,
  catalogForPack,
  excludeProductId,
}: Props) {
  const t = useTranslations("admin");
  const tc = useTranslations("categories");
  const locale = useLocale();
  const { pushToast } = useAdminToast();
  const [draft, setDraft] = useState<ProductDraft>(() =>
    mode === "edit" && initial ? productToDraft(initial) : emptyDraft
  );
  const [imageSource, setImageSource] = useState<ImageSource>(() =>
    mode === "edit" && initial?.image?.startsWith("data:") ? "file" : "url"
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const packSelectable = useMemo(
    () =>
      catalogForPack.filter(
        (p) => p.id !== excludeProductId && p.isPack !== true
      ),
    [catalogForPack, excludeProductId]
  );

  const readFileAsDataUrl = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      setDraft((d) => ({ ...d, image: result }));
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setDraft((d) => ({ ...d, image: "" }));
    setFileName(null);
    if (fileRef.current) fileRef.current.value = "";
    setImageSource("url");
    pushToast(t("toastImageRemoved"), "success");
  };

  const togglePackItem = (id: string) => {
    setDraft((d) => {
      const cur = d.packItemIds ?? [];
      const has = cur.includes(id);
      const next = has ? cur.filter((x) => x !== id) : [...cur, id];
      return { ...d, packItemIds: next };
    });
  };

  const applyPackPrice = () => {
    const ids = draft.packItemIds ?? [];
    if (ids.length < 2) {
      pushToast(t("formPackNeedTwo"), "error");
      return;
    }
    const price = computePackSuggestedPriceMad(
      catalogForPack,
      ids,
      draft.packDiscountPercent ?? 0
    );
    setDraft((d) => ({ ...d, priceMad: price }));
    pushToast(t("toastPackPrice"), "success");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.nameFr.trim() || !draft.nameAr.trim()) return;
    if (!draft.image.trim()) return;
    if (draft.priceMad <= 0) return;
    if (draft.isPack === true && (draft.packItemIds?.length ?? 0) < 2) {
      pushToast(t("formPackNeedTwo"), "error");
      return;
    }
    onSubmit({
      ...draft,
      priceMad: Number(draft.priceMad),
      packDiscountPercent: draft.isPack
        ? Math.min(100, Math.max(0, Number(draft.packDiscountPercent) || 0))
        : undefined,
    });
  };

  const hasPreview = Boolean(draft.image.trim());

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone">
            {t("formNameFr")}
          </label>
          <input
            required
            value={draft.nameFr}
            onChange={(e) => setDraft((d) => ({ ...d, nameFr: e.target.value }))}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone">
            {t("formNameAr")}
          </label>
          <input
            required
            dir="rtl"
            value={draft.nameAr}
            onChange={(e) => setDraft((d) => ({ ...d, nameAr: e.target.value }))}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone">
            {t("formCategory")}
          </label>
          <select
            value={draft.category}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                category: e.target.value as Category,
              }))
            }
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            {ADMIN_CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {tc(o.value)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone">
            {t("formPrice")}
          </label>
          <input
            required
            type="number"
            min={1}
            step={1}
            value={draft.priceMad || ""}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                priceMad: Number(e.target.value) || 0,
              }))
            }
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone">
          {t("formImage")}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setImageSource("url");
              setFileName(null);
              if (fileRef.current) fileRef.current.value = "";
            }}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              imageSource === "url"
                ? "bg-ink text-white"
                : "bg-white text-ink ring-1 ring-zinc-200 hover:bg-zinc-100"
            }`}
          >
            {t("formImageUrl")}
          </button>
          <button
            type="button"
            onClick={() => setImageSource("file")}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              imageSource === "file"
                ? "bg-ink text-white"
                : "bg-white text-ink ring-1 ring-zinc-200 hover:bg-zinc-100"
            }`}
          >
            {t("formImageFile")}
          </button>
        </div>

        {imageSource === "url" ? (
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone">
              {t("formImageUrlLabel")}
            </label>
            <input
              type="text"
              inputMode="url"
              placeholder="https://..."
              value={draft.image.startsWith("data:") ? "" : draft.image}
              onChange={(e) => {
                setDraft((d) => ({ ...d, image: e.target.value }));
                setFileName(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
            {draft.image.startsWith("data:") ? (
              <p className="mt-2 text-xs text-stone">{t("formImageDataHint")}</p>
            ) : null}
          </div>
        ) : (
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone">
              {t("formImageFileLabel")}
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="w-full text-sm file:me-3 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) readFileAsDataUrl(f);
              }}
            />
            {fileName ? (
              <p className="mt-2 text-xs text-stone">{fileName}</p>
            ) : null}
            <p className="mt-2 text-xs text-stone">{t("formImageStorageNote")}</p>
          </div>
        )}

        {hasPreview ? (
          <div className="mt-6">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone">
                {t("formPreview")}
              </p>
              <button
                type="button"
                onClick={clearImage}
                className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
              >
                {t("formRemoveImage")}
              </button>
            </div>
            <div className="relative mx-auto aspect-[3/4] w-full max-w-[220px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              <Image
                src={draft.image}
                alt=""
                fill
                className="object-cover"
                sizes="220px"
                unoptimized={productImageUnoptimized(draft.image)}
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone">
            {t("formDescFr")}
          </label>
          <textarea
            required
            rows={4}
            value={draft.descriptionFr}
            onChange={(e) =>
              setDraft((d) => ({ ...d, descriptionFr: e.target.value }))
            }
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone">
            {t("formDescAr")}
          </label>
          <textarea
            required
            dir="rtl"
            rows={4}
            value={draft.descriptionAr}
            onChange={(e) =>
              setDraft((d) => ({ ...d, descriptionAr: e.target.value }))
            }
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={draft.isNew === true}
            onChange={(e) =>
              setDraft((d) => ({ ...d, isNew: e.target.checked }))
            }
            className="size-4 rounded border-zinc-300 text-accent focus:ring-accent"
          />
          {t("formNew")}
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={draft.isPromo === true}
            onChange={(e) =>
              setDraft((d) => ({ ...d, isPromo: e.target.checked }))
            }
            className="size-4 rounded border-zinc-300 text-accent focus:ring-accent"
          />
          {t("formPromo")}
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={draft.isPack === true}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                isPack: e.target.checked,
                packItemIds: e.target.checked ? d.packItemIds : [],
              }))
            }
            className="size-4 rounded border-zinc-300 text-accent focus:ring-accent"
          />
          {t("formIsPack")}
        </label>
      </div>

      {draft.isPack === true ? (
        <div className="rounded-2xl border border-accent/30 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-ink">{t("formPackItems")}</p>
          <p className="mt-1 text-xs text-stone">{t("formPackNeedTwo")}</p>
          <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto rounded-xl border border-zinc-100 p-3">
            {packSelectable.map((p) => {
              const checked = (draft.packItemIds ?? []).includes(p.id);
              return (
                <li key={p.id}>
                  <label className="flex cursor-pointer items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePackItem(p.id)}
                      className="size-4 rounded border-zinc-300 text-accent"
                    />
                    <span className="flex-1">{productName(p, locale)}</span>
                    <span className="text-xs text-stone">{p.priceMad} MAD</span>
                  </label>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-stone">
                {t("formPackDiscount")}
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={draft.packDiscountPercent ?? 0}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    packDiscountPercent: Number(e.target.value) || 0,
                  }))
                }
                className="w-28 rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={applyPackPrice}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-ink hover:bg-accent/90"
            >
              {t("formPackApplyPrice")}
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded-full bg-ink px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-ink/90"
        >
          {submitLabel}
        </button>
        <Link
          href="/admin/products"
          className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white px-8 py-3.5 text-sm font-semibold text-ink transition hover:bg-zinc-50"
        >
          {t("formCancel")}
        </Link>
      </div>
    </form>
  );
}
