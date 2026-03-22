"use client";

import Link from "next/link";
import { useOrders } from "@/context/orders-context";

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function AdminOrdersPage() {
  const { orders, hydrated } = useOrders();

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-zinc-200" />
        <div className="h-72 animate-pulse rounded-2xl bg-zinc-200" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl text-ink">Commandes</h1>
          <p className="mt-2 text-sm text-stone">
            Aucune commande pour le moment. Elles apparaissent ici après un
            paiement simulé depuis le checkout boutique.
          </p>
        </div>
        <Link
          href="/fr/checkout"
          className="inline-flex rounded-full border border-zinc-200 bg-white px-6 py-2.5 text-sm font-semibold text-ink shadow-sm transition hover:bg-zinc-50"
        >
          Tester le checkout
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink">Commandes</h1>
        <p className="mt-2 text-sm text-stone">
          {orders.length} commande{orders.length !== 1 ? "s" : ""} (localStorage).
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <article
            key={order.id}
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-100 bg-zinc-50 px-4 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-stone">
                  Commande
                </p>
                <p className="mt-1 font-mono text-sm text-ink">{order.id}</p>
                <p className="mt-2 text-xs text-stone">
                  {formatDate(order.date)}
                </p>
              </div>
              <div className="text-end">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone">
                  Total
                </p>
                <p className="mt-1 font-display text-2xl text-accent">
                  {order.total} MAD
                </p>
              </div>
            </div>

            <div className="grid gap-6 px-4 py-5 sm:grid-cols-2 sm:px-6">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-stone">
                  Client
                </h2>
                <ul className="mt-2 space-y-1 text-sm text-ink">
                  <li className="font-medium">{order.customerName}</li>
                  <li>
                    <a
                      href={`mailto:${order.email}`}
                      className="text-accent underline-offset-2 hover:underline"
                    >
                      {order.email}
                    </a>
                  </li>
                  {order.phone ? (
                    <li className="text-stone">{order.phone}</li>
                  ) : null}
                  <li className="text-stone">{order.address}</li>
                  {order.city ? (
                    <li className="text-stone">{order.city}</li>
                  ) : null}
                </ul>
              </div>
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-stone">
                  Articles
                </h2>
                <ul className="mt-2 space-y-2 text-sm">
                  {order.items.map((line) => (
                    <li
                      key={`${line.productId}-${line.size}`}
                      className="flex justify-between gap-4 border-b border-zinc-100 pb-2 last:border-0"
                    >
                      <span className="min-w-0 text-ink">
                        <span className="font-medium">{line.nameFr}</span>
                        <span className="block text-xs text-stone">
                          ×{line.quantity} · {line.size}
                        </span>
                      </span>
                      <span className="shrink-0 font-medium tabular-nums">
                        {line.lineTotalMad} MAD
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
