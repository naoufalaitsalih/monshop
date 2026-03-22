"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { useProductsCatalog } from "@/context/products-context";
import { useAdminToast } from "@/context/admin-toast-context";

export default function AdminEditProductPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const router = useRouter();
  const { hydrated, updateProduct, isCustomProduct, getById } =
    useProductsCatalog();
  const { pushToast } = useAdminToast();

  const product = getById(id);
  const allowed = product && isCustomProduct(id);

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-56 animate-pulse rounded-lg bg-zinc-200" />
        <div className="h-96 animate-pulse rounded-2xl bg-zinc-200" />
      </div>
    );
  }

  if (!product || !allowed) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <p className="text-stone">
          Produit introuvable ou catalogue d&apos;origine (non modifiable ici).
        </p>
        <Link
          href="/admin/products"
          className="mt-6 inline-block text-sm font-semibold text-accent underline-offset-4 hover:underline"
        >
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink">Modifier le produit</h1>
        <p className="mt-2 text-sm text-stone">
          Slug et ID conservés pour les liens et le panier.
        </p>
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <ProductForm
          key={product.id}
          mode="edit"
          initial={product}
          submitLabel="Enregistrer"
          onSubmit={(draft) => {
            const ok = updateProduct(product.id, draft);
            if (ok) {
              pushToast("Produit mis à jour.", "success");
              router.push("/admin/products");
            } else {
              pushToast("Échec de la mise à jour.", "error");
            }
          }}
        />
      </div>
    </div>
  );
}
