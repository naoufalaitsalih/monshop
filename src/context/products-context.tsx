"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Category, Product } from "@/data/products";
import { products as seedProducts } from "@/data/products";
import { slugify } from "@/lib/slugify";

const STORAGE_KEY = "maison-moda-products-v1";

export type ProductDraft = {
  nameFr: string;
  nameAr: string;
  category: Category;
  priceMad: number;
  image: string;
  descriptionFr: string;
  descriptionAr: string;
  isNew?: boolean;
  isPromo?: boolean;
};

type Persisted = {
  removedIds: string[];
  customProducts: Product[];
  /** Surcharges complètes des produits du catalogue seed (même id / slug). */
  seedEdits: Record<string, Product>;
};

type ProductsContextValue = {
  products: Product[];
  hydrated: boolean;
  categoryCount: number;
  addProduct: (draft: ProductDraft) => Product;
  removeProduct: (id: string) => void;
  updateProduct: (id: string, draft: ProductDraft) => boolean;
  getBySlug: (slug: string) => Product | undefined;
  getById: (id: string) => Product | undefined;
  isCustomProduct: (id: string) => boolean;
};

const ProductsContext = createContext<ProductsContextValue | null>(null);

function normalizeSeedEdits(raw: unknown): Record<string, Product> {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  const out: Record<string, Product> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (v && typeof v === "object" && "id" in v && String((v as Product).id) === k) {
      out[k] = v as Product;
    }
  }
  return out;
}

function loadPersisted(): Persisted {
  if (typeof window === "undefined") {
    return { removedIds: [], customProducts: [], seedEdits: {} };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { removedIds: [], customProducts: [], seedEdits: {} };
    }
    const p = JSON.parse(raw) as Partial<Persisted>;
    return {
      removedIds: Array.isArray(p.removedIds) ? p.removedIds : [],
      customProducts: Array.isArray(p.customProducts) ? p.customProducts : [],
      seedEdits: normalizeSeedEdits(p.seedEdits),
    };
  } catch {
    return { removedIds: [], customProducts: [], seedEdits: {} };
  }
}

function mergeCatalog(persisted: Persisted): Product[] {
  const removed = new Set(persisted.removedIds);
  const base = seedProducts
    .filter((p) => !removed.has(p.id))
    .map((p) => persisted.seedEdits[p.id] ?? p);
  return [...base, ...persisted.customProducts];
}

function uniqueSlug(nameFr: string, existing: Product[], excludeId?: string) {
  const taken = new Set(
    existing.filter((p) => p.id !== excludeId).map((p) => p.slug)
  );
  const base = slugify(nameFr);
  let slug = base;
  let n = 0;
  while (taken.has(slug)) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

function draftToProduct(
  id: string,
  slug: string,
  draft: ProductDraft,
  sizes: string[]
): Product {
  const image = draft.image.trim();
  const priceMad = Number(draft.priceMad);
  const compareAtPriceMad =
    draft.isPromo === true
      ? Math.max(priceMad + 1, Math.round(priceMad * 1.2))
      : undefined;
  const sizeList = sizes.length > 0 ? sizes : ["TU"];
  return {
    id,
    slug,
    category: draft.category,
    priceMad,
    compareAtPriceMad,
    image,
    images: image ? [image] : [],
    sizes: sizeList,
    nameFr: draft.nameFr.trim(),
    nameAr: draft.nameAr.trim(),
    shortDescriptionFr: draft.descriptionFr.trim(),
    shortDescriptionAr: draft.descriptionAr.trim(),
    longDescriptionFr: draft.descriptionFr.trim(),
    longDescriptionAr: draft.descriptionAr.trim(),
    isNew: draft.isNew === true ? true : undefined,
    isPromo: draft.isPromo === true ? true : undefined,
  };
}

function omitSeedEdit(
  edits: Record<string, Product>,
  id: string
): Record<string, Product> {
  const next = { ...edits };
  delete next[id];
  return next;
}

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [persisted, setPersisted] = useState<Persisted>({
    removedIds: [],
    customProducts: [],
    seedEdits: {},
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPersisted(loadPersisted());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  }, [persisted, hydrated]);

  const products = useMemo(() => mergeCatalog(persisted), [persisted]);

  const customIds = useMemo(
    () => new Set(persisted.customProducts.map((p) => p.id)),
    [persisted.customProducts]
  );

  const categoryCount = useMemo(() => {
    return new Set(products.map((p) => p.category)).size;
  }, [products]);

  const addProduct = useCallback((draft: ProductDraft) => {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `p-${Date.now()}`;
    let created!: Product;
    setPersisted((prev) => {
      const list = mergeCatalog(prev);
      const slug = uniqueSlug(draft.nameFr, list);
      created = draftToProduct(id, slug, draft, ["TU"]);
      return {
        ...prev,
        customProducts: [...prev.customProducts, created],
      };
    });
    return created;
  }, []);

  const removeProduct = useCallback((id: string) => {
    setPersisted((prev) => {
      const isSeed = seedProducts.some((p) => p.id === id);
      if (isSeed) {
        if (prev.removedIds.includes(id)) return prev;
        const seedEdits = omitSeedEdit(prev.seedEdits, id);
        return {
          ...prev,
          removedIds: [...prev.removedIds, id],
          seedEdits,
        };
      }
      return {
        ...prev,
        customProducts: prev.customProducts.filter((p) => p.id !== id),
      };
    });
  }, []);

  const updateProduct = useCallback((id: string, draft: ProductDraft) => {
    let ok = false;
    setPersisted((prev) => {
      const seed = seedProducts.find((p) => p.id === id);
      if (seed) {
        const merged = draftToProduct(id, seed.slug, draft, seed.sizes);
        ok = true;
        return {
          ...prev,
          seedEdits: { ...prev.seedEdits, [id]: merged },
        };
      }
      const idx = prev.customProducts.findIndex((p) => p.id === id);
      if (idx < 0) return prev;
      const existing = prev.customProducts[idx];
      const slug = existing.slug;
      const updated = draftToProduct(id, slug, draft, existing.sizes);
      const nextCustom = [...prev.customProducts];
      nextCustom[idx] = updated;
      ok = true;
      return { ...prev, customProducts: nextCustom };
    });
    return ok;
  }, []);

  const getBySlug = useCallback(
    (slug: string) => products.find((p) => p.slug === slug),
    [products]
  );

  const getById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products]
  );

  const isCustomProduct = useCallback(
    (id: string) => customIds.has(id),
    [customIds]
  );

  const value = useMemo(
    () => ({
      products,
      hydrated,
      categoryCount,
      addProduct,
      removeProduct,
      updateProduct,
      getBySlug,
      getById,
      isCustomProduct,
    }),
    [
      products,
      hydrated,
      categoryCount,
      addProduct,
      removeProduct,
      updateProduct,
      getBySlug,
      getById,
      isCustomProduct,
    ]
  );

  return (
    <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
  );
}

export function useProductsCatalog() {
  const ctx = useContext(ProductsContext);
  if (!ctx) {
    throw new Error("useProductsCatalog must be used within ProductsProvider");
  }
  return ctx;
}
