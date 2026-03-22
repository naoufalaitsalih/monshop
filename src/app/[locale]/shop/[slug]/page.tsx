import { products } from "@/data/products";
import { CatalogProductPage } from "@/components/catalog-product-page";

export const dynamicParams = true;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  return <CatalogProductPage slug={slug} />;
}
