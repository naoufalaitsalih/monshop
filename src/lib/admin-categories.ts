import type { Category } from "@/data/products";

export const ADMIN_CATEGORY_OPTIONS: { value: Category; labelFr: string }[] = [
  { value: "sandals", labelFr: "Sandales" },
  { value: "bags", labelFr: "Sacs" },
  { value: "dresses", labelFr: "Robes" },
  { value: "sunglasses", labelFr: "Lunettes" },
  { value: "pack", labelFr: "Pack" },
];

export function categoryLabelFr(category: Category): string {
  return (
    ADMIN_CATEGORY_OPTIONS.find((o) => o.value === category)?.labelFr ?? category
  );
}
