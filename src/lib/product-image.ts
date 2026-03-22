/** Next/Image remote config only allows some hosts; skip optimization for others. */
export function productImageUnoptimized(src: string): boolean {
  try {
    return new URL(src).hostname !== "images.unsplash.com";
  } catch {
    return true;
  }
}
