"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { slugify } from "@/lib/slugify";

const STORAGE_KEY = "maison-moda-shop-categories-v1";

export type ShopCategory = {
  id: string;
  nameFr: string;
  nameAr: string;
  image: string;
  createdAt: string;
};

const SEED_ISO = "2024-01-01T00:00:00.000Z";

export const DEFAULT_SHOP_CATEGORIES: ShopCategory[] = [
  {
    id: "sandals",
    nameFr: "Sandales",
    nameAr: "صنادل",
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=900&q=85",
    createdAt: SEED_ISO,
  },
  {
    id: "bags",
    nameFr: "Sacs",
    nameAr: "حقائب",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900&q=85",
    createdAt: SEED_ISO,
  },
  {
    id: "sunglasses",
    nameFr: "Lunettes",
    nameAr: "نظارات",
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=900&q=85",
    createdAt: SEED_ISO,
  },
  {
    id: "dresses",
    nameFr: "Robes",
    nameAr: "فساتين",
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&q=85",
    createdAt: SEED_ISO,
  },
  {
    id: "pack",
    nameFr: "Packs",
    nameAr: "حزم",
    image:
      "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=900&q=85",
    createdAt: SEED_ISO,
  },
];

function normalizeCategory(raw: unknown): ShopCategory | null {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw as Partial<ShopCategory>;
  const id = String(o.id ?? "").trim();
  const nameFr = String(o.nameFr ?? "").trim();
  const nameAr = String(o.nameAr ?? "").trim();
  const image = String(o.image ?? "").trim();
  if (!id || !nameFr || !nameAr || !image) return null;
  return {
    id,
    nameFr,
    nameAr,
    image,
    createdAt:
      typeof o.createdAt === "string" && o.createdAt
        ? o.createdAt
        : new Date().toISOString(),
  };
}

function loadCategories(): ShopCategory[] {
  if (typeof window === "undefined") return [...DEFAULT_SHOP_CATEGORIES];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_SHOP_CATEGORIES];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [...DEFAULT_SHOP_CATEGORIES];
    const list = parsed
      .map(normalizeCategory)
      .filter((x): x is ShopCategory => x != null);
    return list.length > 0 ? list : [...DEFAULT_SHOP_CATEGORIES];
  } catch {
    return [...DEFAULT_SHOP_CATEGORIES];
  }
}

export type CategoryDraft = {
  nameFr: string;
  nameAr: string;
  image: string;
};

type CategoriesContextValue = {
  categories: ShopCategory[];
  hydrated: boolean;
  getById: (id: string) => ShopCategory | undefined;
  label: (id: string, locale: string) => string;
  addCategory: (draft: CategoryDraft) => ShopCategory;
  updateCategory: (id: string, draft: CategoryDraft) => boolean;
  removeCategory: (id: string) => void;
};

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

function uniqueId(base: string, existing: Set<string>): string {
  let id = base || "categorie";
  let n = 0;
  while (existing.has(id)) {
    n += 1;
    id = `${base}-${n}`;
  }
  return id;
}

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<ShopCategory[]>(
    () => [...DEFAULT_SHOP_CATEGORIES]
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCategories(loadCategories());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  }, [categories, hydrated]);

  const getById = useCallback(
    (id: string) => categories.find((c) => c.id === id),
    [categories]
  );

  const label = useCallback(
    (id: string, locale: string) => {
      const c = categories.find((x) => x.id === id);
      if (!c) return id;
      return locale === "ar" ? c.nameAr : c.nameFr;
    },
    [categories]
  );

  const addCategory = useCallback((draft: CategoryDraft) => {
    let created!: ShopCategory;
    setCategories((prev) => {
      const ids = new Set(prev.map((c) => c.id));
      const base = slugify(draft.nameFr.trim());
      const id = uniqueId(base || "categorie", ids);
      created = {
        id,
        nameFr: draft.nameFr.trim(),
        nameAr: draft.nameAr.trim(),
        image: draft.image.trim(),
        createdAt: new Date().toISOString(),
      };
      return [...prev, created];
    });
    return created;
  }, []);

  const updateCategory = useCallback((id: string, draft: CategoryDraft) => {
    let ok = false;
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx < 0) return prev;
      ok = true;
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        nameFr: draft.nameFr.trim(),
        nameAr: draft.nameAr.trim(),
        image: draft.image.trim(),
      };
      return next;
    });
    return ok;
  }, []);

  const removeCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      categories,
      hydrated,
      getById,
      label,
      addCategory,
      updateCategory,
      removeCategory,
    }),
    [
      categories,
      hydrated,
      getById,
      label,
      addCategory,
      updateCategory,
      removeCategory,
    ]
  );

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useShopCategories() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) {
    throw new Error("useShopCategories must be used within CategoriesProvider");
  }
  return ctx;
}
