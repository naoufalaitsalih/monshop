"use client";

import { useState } from "react";
import type { Category, Product } from "@/data/products";
import type { ProductDraft } from "@/context/products-context";
import { ADMIN_CATEGORY_OPTIONS } from "@/lib/admin-categories";

type Props = {
  mode: "create" | "edit";
  initial?: Product;
  submitLabel: string;
  onSubmit: (draft: ProductDraft) => void;
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
  };
}

export function ProductForm({ mode, initial, submitLabel, onSubmit }: Props) {
  const [draft, setDraft] = useState<ProductDraft>(() =>
    mode === "edit" && initial ? productToDraft(initial) : emptyDraft
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.nameFr.trim() || !draft.nameAr.trim()) return;
    if (!draft.image.trim()) return;
    if (draft.priceMad <= 0) return;
    onSubmit({
      ...draft,
      priceMad: Number(draft.priceMad),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone">
            Nom (FR)
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
            Nom (AR)
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
            Catégorie
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
                {o.labelFr}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone">
            Prix (MAD)
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

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone">
          URL de l&apos;image
        </label>
        <input
          required
          type="text"
          inputMode="url"
          placeholder="https://images.unsplash.com/..."
          value={draft.image}
          onChange={(e) => setDraft((d) => ({ ...d, image: e.target.value }))}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone">
            Description (FR)
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
            Description (AR)
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
          Nouveau (isNew)
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
          Promo (isPromo)
        </label>
      </div>

      <button
        type="submit"
        className="rounded-full bg-ink px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-ink/90"
      >
        {submitLabel}
      </button>
    </form>
  );
}
