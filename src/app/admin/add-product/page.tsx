"use client";

import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { useProductsCatalog } from "@/context/products-context";
import { useAdminToast } from "@/context/admin-toast-context";

export default function AdminAddProductPage() {
  const router = useRouter();
  const { addProduct } = useProductsCatalog();
  const { pushToast } = useAdminToast();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink">Ajouter un produit</h1>
        <p className="mt-2 text-sm text-stone">
          Le produit sera enregistré localement et visible sur la boutique.
        </p>
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <ProductForm
          mode="create"
          submitLabel="Ajouter le produit"
          onSubmit={(draft) => {
            addProduct(draft);
            pushToast("Produit ajouté avec succès.", "success");
            router.push("/admin/products");
          }}
        />
      </div>
    </div>
  );
}
