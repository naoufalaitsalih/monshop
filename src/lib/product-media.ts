/** Première URL affichable (galerie multi-images + rétrocompat `image`). */
export function productPrimaryImage(p: {
  image: string;
  images?: string[];
}): string {
  const list = p.images?.filter(Boolean) ?? [];
  return list[0] ?? p.image ?? "";
}
