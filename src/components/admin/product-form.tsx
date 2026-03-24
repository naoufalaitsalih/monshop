"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Category, PackItem, Product } from "@/data/products";
import { isPackProduct } from "@/data/products";
import type { ProductDraft } from "@/context/products-context";
import { sanitizePackItemsForSave } from "@/context/products-context";
import { useAdminToast } from "@/context/admin-toast-context";
import { useAdminClickLog } from "@/hooks/use-admin-click-log";
import { useShopCategories } from "@/context/categories-context";
import { productImageUnoptimized } from "@/lib/product-image";
import { productPrimaryImage } from "@/lib/product-media";
import { productName } from "@/lib/product-labels";

type Props = {
  mode: "create" | "edit";
  initial?: Product;
  submitLabel: string;
  onSubmit: (draft: ProductDraft) => void;
  catalogForPack: Product[];
  excludeProductId?: string;
  onCancel?: () => void;
  /** S’incrémente à chaque ouverture en édition depuis la liste — focus nom FR */
  focusNameNonce?: number;
};

const emptyDraft: ProductDraft = {
  nameFr: "",
  nameAr: "",
  category: "sandals",
  priceMad: 0,
  images: [],
  descriptionFr: "",
  descriptionAr: "",
  isNew: false,
  isPromo: false,
  packItems: [],
};

function productToDraft(p: Product): ProductDraft {
  const imgs =
    p.images && p.images.length > 0
      ? [...p.images]
      : p.image
        ? [p.image]
        : [];
  const packItems: PackItem[] = p.packItems?.length ? [...p.packItems] : [];
  return {
    nameFr: p.nameFr,
    nameAr: p.nameAr,
    category: p.category,
    priceMad: p.priceMad,
    images: imgs,
    descriptionFr: p.shortDescriptionFr,
    descriptionAr: p.shortDescriptionAr,
    isNew: p.isNew === true,
    isPromo: p.isPromo === true,
    packItems,
  };
}

function parseUrlBatch(text: string): string[] {
  return text
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function ProductForm({
  mode,
  initial,
  submitLabel,
  onSubmit,
  catalogForPack,
  excludeProductId,
  onCancel,
  focusNameNonce = 0,
}: Props) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const { categories: shopCategories } = useShopCategories();
  const { pushToast } = useAdminToast();
  const { logClick } = useAdminClickLog();
  const nameFrInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<ProductDraft>(() =>
    mode === "edit" && initial ? productToDraft(initial) : emptyDraft
  );
  const [urlInput, setUrlInput] = useState("");
  const [urlBatch, setUrlBatch] = useState("");
  const [draggingImageIndex, setDraggingImageIndex] = useState<number | null>(
    null
  );
  const [imageDropActive, setImageDropActive] = useState(false);

  const isPackMode = draft.category === "pack";

  useEffect(() => {
    if (mode !== "edit" || focusNameNonce === 0) return;
    const frame = requestAnimationFrame(() => {
      nameFrInputRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [mode, focusNameNonce]);

  const packSelectable = useMemo(
    () =>
      catalogForPack.filter(
        (p) =>
          p.id !== excludeProductId &&
          !isPackProduct(p)
      ),
    [catalogForPack, excludeProductId]
  );

  const productById = useMemo(() => {
    const m = new Map<string, Product>();
    for (const p of catalogForPack) m.set(p.id, p);
    return m;
  }, [catalogForPack]);

  const addImages = (urls: string[]) => {
    if (urls.length === 0) return;
    setDraft((d) => {
      const cur = d.images ?? [];
      const next = [...cur, ...urls];
      return { ...d, images: [...new Set(next)] };
    });
  };

  const removeImageAt = (index: number) => {
    setDraft((d) => ({
      ...d,
      images: (d.images ?? []).filter((_, i) => i !== index),
    }));
    pushToast(t("toastImageRemoved"), "success");
  };

  const reorderImages = (from: number, to: number) => {
    setDraft((d) => {
      const imgs = [...(d.images ?? [])];
      if (
        from === to ||
        from < 0 ||
        to < 0 ||
        from >= imgs.length ||
        to >= imgs.length
      ) {
        return d;
      }
      const [item] = imgs.splice(from, 1);
      imgs.splice(to, 0, item);
      return { ...d, images: imgs };
    });
  };

  const readFilesAsDataUrls = (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;
    let remaining = list.length;
    const urls: string[] = [];
    for (const file of list) {
      const reader = new FileReader();
      reader.onload = () => {
        const r = String(reader.result ?? "");
        if (r) urls.push(r);
        remaining -= 1;
        if (remaining === 0) addImages(urls);
      };
      reader.readAsDataURL(file);
    }
  };

  const hasExisting = (id: string) =>
    (draft.packItems ?? []).some(
      (x) => x.type === "existing" && x.productId === id
    );

  const togglePackItem = (id: string) => {
    const wasSelected = hasExisting(id);
    setDraft((d) => {
      const cur = d.packItems ?? [];
      const idx = cur.findIndex(
        (x) => x.type === "existing" && x.productId === id
      );
      if (idx >= 0) {
        return { ...d, packItems: cur.filter((_, i) => i !== idx) };
      }
      return { ...d, packItems: [...cur, { type: "existing", productId: id }] };
    });
    pushToast(
      t(wasSelected ? "toastPackItemRemoved" : "toastPackItemAdded"),
      "success"
    );
  };

  const addCustomPackRow = () => {
    setDraft((d) => ({
      ...d,
      packItems: [
        ...(d.packItems ?? []),
        { type: "custom", name: "", priceMad: 0, image: "" },
      ],
    }));
    pushToast(t("toastPackItemAdded"), "success");
  };

  const removePackItemAt = (index: number) => {
    setDraft((d) => ({
      ...d,
      packItems: (d.packItems ?? []).filter((_, i) => i !== index),
    }));
    pushToast(t("toastPackItemRemoved"), "success");
  };

  const updatePackItem = (index: number, next: PackItem) => {
    setDraft((d) => {
      const cur = [...(d.packItems ?? [])];
      cur[index] = next;
      return { ...d, packItems: cur };
    });
  };

  const handleCategoryChange = (category: Category) => {
    setDraft((d) => ({
      ...d,
      category,
      packItems: category === "pack" ? d.packItems : [],
      isPromo: category === "pack" ? false : d.isPromo,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.nameFr.trim() || !draft.nameAr.trim()) return;
    const imgs = (draft.images ?? []).map((s) => s.trim()).filter(Boolean);
    if (imgs.length === 0) return;
    if (draft.priceMad <= 0) return;

    if (isPackMode) {
      const valid = sanitizePackItemsForSave(draft.packItems);
      if (valid.length < 1) {
        pushToast(t("formPackNeedOne"), "error");
        return;
      }
    } else {
      if (!draft.descriptionFr.trim() || !draft.descriptionAr.trim()) return;
    }

    onSubmit({
      ...draft,
      images: imgs,
      priceMad: Number(draft.priceMad),
      packItems: isPackMode ? draft.packItems : [],
      descriptionFr: draft.descriptionFr.trim(),
      descriptionAr: draft.descriptionAr.trim(),
    });
  };

  const hasProductImages = (draft.images ?? []).some(
    (s) => String(s).trim().length > 0
  );

  const packItemsValid = useMemo(() => {
    if (!isPackMode) return true;
    return sanitizePackItemsForSave(draft.packItems).length >= 1;
  }, [isPackMode, draft.packItems]);

  const descriptionsOk =
    isPackMode ||
    (Boolean(draft.descriptionFr.trim()) &&
      Boolean(draft.descriptionAr.trim()));

  const canSubmit =
    Boolean(draft.nameFr.trim()) &&
    Boolean(draft.nameAr.trim()) &&
    Number(draft.priceMad) > 0 &&
    hasProductImages &&
    descriptionsOk &&
    packItemsValid;

  const isSubmitDisabled = !canSubmit;

  const imageSection = (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone">
        {t("formImages")}
      </p>
      <p className="mt-1 text-xs text-stone">{t("formImagesHint")}</p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
          setImageDropActive(true);
        }}
        onDragLeave={() => setImageDropActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setImageDropActive(false);
          const fl = e.dataTransfer.files;
          if (fl?.length) readFilesAsDataUrls(fl);
        }}
        className={`mt-4 rounded-xl border-2 border-dashed px-4 py-6 text-center text-sm transition-colors ${
          imageDropActive
            ? "border-accent bg-accent/10 text-ink"
            : "border-zinc-200 bg-white/60 text-stone"
        }`}
      >
        {t("formImagesDragHint")}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          type="text"
          inputMode="url"
          placeholder="https://..."
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          className="min-w-[200px] flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        <button
          type="button"
          onClick={() => {
            logClick("CLICK_PRODUCT_IMAGE_ADD_URL", "product", urlInput.trim());
            const u = urlInput.trim();
            if (!u) return;
            addImages([u]);
            setUrlInput("");
          }}
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink/90"
        >
          {t("formAddImageUrl")}
        </button>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone">
          {t("formImageUrlBatch")}
        </label>
        <textarea
          rows={3}
          value={urlBatch}
          onChange={(e) => setUrlBatch(e.target.value)}
          placeholder="https://a.jpg&#10;https://b.jpg"
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        <button
          type="button"
          onClick={() => {
            logClick("CLICK_PRODUCT_IMAGE_IMPORT_BATCH", "product", "");
            const urls = parseUrlBatch(urlBatch);
            if (urls.length) addImages(urls);
            setUrlBatch("");
          }}
          className="mt-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-ink hover:bg-zinc-50"
        >
          {t("formImportUrls")}
        </button>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone">
          {t("formImageFilesMulti")}
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          className="w-full text-sm file:me-3 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink"
          onChange={(e) => {
            const fl = e.target.files;
            if (fl?.length) readFilesAsDataUrls(fl);
            e.target.value = "";
          }}
        />
        <p className="mt-2 text-xs text-stone">{t("formImageStorageNote")}</p>
      </div>

      {(draft.images ?? []).length > 0 ? (
        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone">
            {t("formPreview")} — {t("formImageReorderHint")}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {(draft.images ?? []).map((src, i) => {
              const len = (draft.images ?? []).length;
              return (
                <div
                  key={`${i}-${src.slice(0, 32)}`}
                  draggable
                  onDragStart={() => setDraggingImageIndex(i)}
                  onDragEnd={() => setDraggingImageIndex(null)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const fl = e.dataTransfer.files;
                    if (fl?.length) {
                      readFilesAsDataUrls(fl);
                      setDraggingImageIndex(null);
                      return;
                    }
                    if (draggingImageIndex === null) return;
                    reorderImages(draggingImageIndex, i);
                    setDraggingImageIndex(null);
                  }}
                  className={`group relative aspect-[3/4] cursor-grab overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm active:cursor-grabbing ${
                    draggingImageIndex === i ? "opacity-60 ring-2 ring-accent" : ""
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="pointer-events-none object-cover"
                    sizes="(max-width:768px) 50vw, 25vw"
                    unoptimized={productImageUnoptimized(src)}
                  />
                  <div className="absolute start-1 top-1 flex flex-col gap-0.5">
                    <button
                      type="button"
                      disabled={i === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        logClick(
                          "CLICK_PRODUCT_IMAGE_MOVE_UP",
                          "product",
                          `index=${i}`
                        );
                        reorderImages(i, i - 1);
                      }}
                      className="rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-bold shadow disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="↑"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={i >= len - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        logClick(
                          "CLICK_PRODUCT_IMAGE_MOVE_DOWN",
                          "product",
                          `index=${i}`
                        );
                        reorderImages(i, i + 1);
                      }}
                      className="rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-bold shadow disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="↓"
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      logClick(
                        "CLICK_PRODUCT_IMAGE_REMOVE",
                        "product",
                        `index=${i}`
                      );
                      removeImageAt(i);
                    }}
                    className="absolute end-2 top-2 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white opacity-90 shadow hover:opacity-100"
                    aria-label={t("formRemoveOneImage")}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {!hasProductImages ? (
        <p
          className="mt-4 text-sm font-medium text-amber-800"
          role="status"
        >
          {t("formImagesRequiredHint")}
        </p>
      ) : null}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone">
          {t("formCategory")}
        </label>
        <select
          value={draft.category}
          onChange={(e) =>
            handleCategoryChange(e.target.value as Category)
          }
          className="w-full max-w-md rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        >
          {mode === "edit" &&
          initial &&
          !shopCategories.some((c) => c.id === draft.category) ? (
            <option value={draft.category}>
              {draft.category} ({t("formCategoryOrphan")})
            </option>
          ) : null}
          {shopCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {locale === "ar" ? c.nameAr : c.nameFr}
            </option>
          ))}
        </select>
        {isPackMode ? (
          <p className="mt-2 max-w-xl text-xs text-stone">
            {t("formPackCategoryOnlyHint")}
          </p>
        ) : null}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone">
            {isPackMode ? t("formPackNameFr") : t("formNameFr")}
          </label>
          <input
            ref={nameFrInputRef}
            required
            value={draft.nameFr}
            onChange={(e) => setDraft((d) => ({ ...d, nameFr: e.target.value }))}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone">
            {isPackMode ? t("formPackNameAr") : t("formNameAr")}
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

      <div className="max-w-xs">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone">
          {isPackMode ? t("formPackPriceManual") : t("formPrice")}
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

      {imageSection}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone">
            {t("formDescFr")}
            {isPackMode ? (
              <span className="ms-1 font-normal normal-case text-stone">
                ({t("formOptional")})
              </span>
            ) : null}
          </label>
          <textarea
            required={!isPackMode}
            rows={isPackMode ? 3 : 4}
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
            {isPackMode ? (
              <span className="ms-1 font-normal normal-case text-stone">
                ({t("formOptional")})
              </span>
            ) : null}
          </label>
          <textarea
            required={!isPackMode}
            dir="rtl"
            rows={isPackMode ? 3 : 4}
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
        {!isPackMode ? (
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
        ) : null}
      </div>

      {isPackMode ? (
        <div className="space-y-6 rounded-2xl border border-accent/30 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-ink">
              {t("formPackCatalogPick")}
            </p>
            <p className="mt-1 text-xs text-stone">{t("formPackCatalogHint")}</p>
            <ul className="mt-4 max-h-52 space-y-2 overflow-y-auto rounded-xl border border-zinc-100 p-3">
              {packSelectable.map((p) => {
                const checked = hasExisting(p.id);
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
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-ink">
                {t("formPackContentsTitle")}
              </p>
              <button
                type="button"
                onClick={() => {
                  logClick("CLICK_PRODUCT_PACK_ADD_ROW", "product", "");
                  addCustomPackRow();
                }}
                className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-semibold text-ink hover:bg-zinc-100"
              >
                {t("formPackAddProductButton")}
              </button>
            </div>

            {(draft.packItems ?? []).length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-6 text-center text-sm text-stone">
                {t("formPackContentsEmpty")}
              </p>
            ) : (
              <ul className="mt-4 space-y-4">
                {(draft.packItems ?? []).map((it, index) => {
                  if (it.type === "existing") {
                    const sub = productById.get(it.productId);
                    if (!sub) return null;
                    const src = productPrimaryImage(sub);
                    return (
                      <li
                        key={`e-${it.productId}-${index}`}
                        className="flex gap-4 rounded-xl border border-zinc-100 bg-zinc-50/80 p-4"
                      >
                        <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-200">
                          <Image
                            src={src}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="64px"
                            unoptimized={productImageUnoptimized(src)}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-ink">
                            {productName(sub, locale)}
                          </p>
                          <p className="text-xs text-stone">
                            {sub.priceMad} MAD · {t("formPackLineCatalog")}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            logClick(
                              "CLICK_PRODUCT_PACK_REMOVE_ITEM",
                              "product",
                              `index=${index} · catalog`
                            );
                            removePackItemAt(index);
                          }}
                          className="shrink-0 self-start rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                        >
                          {t("formPackRemoveFromPack")}
                        </button>
                      </li>
                    );
                  }

                  return (
                    <li
                      key={`c-${index}`}
                      className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-4"
                    >
                      <div className="mb-3 flex justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-stone">
                          {t("formPackCustomBadge")}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            logClick(
                              "CLICK_PRODUCT_PACK_REMOVE_ITEM",
                              "product",
                              `index=${index} · custom`
                            );
                            removePackItemAt(index);
                          }}
                          className="text-xs font-semibold text-red-600 hover:underline"
                        >
                          {t("formPackRemoveFromPack")}
                        </button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-stone">
                            {t("formPackCustomName")}
                          </label>
                          <input
                            value={it.name}
                            onChange={(e) =>
                              updatePackItem(index, {
                                ...it,
                                name: e.target.value,
                              })
                            }
                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-stone">
                            {t("formPackCustomPrice")}
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={it.priceMad || ""}
                            onChange={(e) =>
                              updatePackItem(index, {
                                ...it,
                                priceMad: Number(e.target.value) || 0,
                              })
                            }
                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="mb-1 block text-xs font-semibold text-stone">
                          {t("formPackCustomImageUrl")}
                        </label>
                        <input
                          value={it.image.startsWith("data:") ? "" : it.image}
                          onChange={(e) =>
                            updatePackItem(index, {
                              ...it,
                              image: e.target.value,
                            })
                          }
                          placeholder="https://..."
                          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          className="mt-2 w-full text-xs file:rounded file:border-0 file:bg-accent file:px-2 file:py-1"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (!f || !f.type.startsWith("image/")) return;
                            const i = index;
                            const reader = new FileReader();
                            reader.onload = () => {
                              const r = String(reader.result ?? "");
                              if (!r) return;
                              setDraft((d) => {
                                const cur = [...(d.packItems ?? [])];
                                const prev = cur[i];
                                if (!prev || prev.type !== "custom") return d;
                                cur[i] = { ...prev, image: r };
                                return { ...d, packItems: cur };
                              });
                            };
                            reader.readAsDataURL(f);
                            e.target.value = "";
                          }}
                        />
                      </div>
                      {it.image ? (
                        <div className="relative mt-3 h-24 w-24 overflow-hidden rounded-lg border border-zinc-200">
                          <Image
                            src={it.image}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="96px"
                            unoptimized={productImageUnoptimized(it.image)}
                          />
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}

      {isSubmitDisabled ? (
        <p
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="status"
        >
          {t("formSubmitBlockedHint")}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSubmitDisabled}
          onClick={() =>
            logClick(
              "CLICK_PRODUCT_FORM_SUBMIT",
              "product",
              `${mode} · ${initial?.id ?? "new"} · ${draft.nameFr.trim() || "—"}`
            )
          }
          className={`rounded-full px-8 py-3.5 text-sm font-semibold transition ${
            isSubmitDisabled
              ? "cursor-not-allowed bg-ink text-white opacity-50"
              : "bg-ink text-white hover:bg-ink/90"
          }`}
        >
          {submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={() => {
              logClick(
                "CLICK_PRODUCT_FORM_CANCEL",
                "product",
                `${mode} · ${initial?.id ?? "new"}`
              );
              onCancel();
            }}
            className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white px-8 py-3.5 text-sm font-semibold text-ink transition hover:bg-zinc-50"
          >
            {t("formCancel")}
          </button>
        ) : null}
      </div>
    </form>
  );
}
