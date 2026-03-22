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

function loadPersisted(): Persisted {
  if (typeof window === "undefined") {
    return { removedIds: [], customProducts: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { removedIds: [], customProducts: [] };
    const p = JSON.parse(raw) as Persisted;
    return {
      removedIds: Array.isArray(p.removedIds) ? p.removedIds : [],
      customProducts: Array.isArray(p.customProducts) ? p.customProducts : [],
    };
  } catch {
    return { removedIds: [], customProducts: [] };
  }
}

function mergeCatalog(persisted: Persisted): Product[] {
  const removed = new Set(persisted.removedIds);
  const base = seedProducts.filter((p) => !removed.has(p.id));
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
  draft: ProductDraft
): Product {
  const image = draft.image.trim();
  const priceMad = Number(draft.priceMad);
  const compareAtPriceMad =
    draft.isPromo === true
      ? Math.max(priceMad + 1, Math.round(priceMad * 1.2))
      : undefined;
  return {
    id,
    slug,
    category: draft.category,
    priceMad,
    compareAtPriceMad,
    image,
    images: image ? [image] : [],
    sizes: ["TU"],
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

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [persisted, setPersisted] = useState<Persisted>({
    removedIds: [],
    customProducts: [],
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
      created = draftToProduct(id, slug, draft);
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
        return { ...prev, removedIds: [...prev.removedIds, id] };
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
      const idx = prev.customProducts.findIndex((p) => p.id === id);
      if (idx < 0) return prev;
      const existing = prev.customProducts[idx];
      const slug = existing.slug;
      const updated = draftToProduct(id, slug, draft);
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
