/** Next/Image : éviter l’optimisation pour hôtes non configurés, data URLs et blob. */
export function productImageUnoptimized(src: string): boolean {
  if (!src || src.startsWith("data:") || src.startsWith("blob:")) {
    return true;
  }
  try {
    return new URL(src).hostname !== "images.unsplash.com";
  } catch {
    return true;
  }
}
