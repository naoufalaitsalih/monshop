"use client";

import { useMemo, useState, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useClients } from "@/context/clients-context";
import type { Client, ClientSource } from "@/context/clients-context";
import { useOrders } from "@/context/orders-context";
import { useAdminToast } from "@/context/admin-toast-context";
import { StatCard } from "@/components/admin/stat-card";
import { ClientDetailModal } from "@/components/admin/client-detail-modal";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { RequireAdminAccess } from "@/components/admin/require-admin-access";
import { useAdminRbac } from "@/context/admin-rbac-context";

function formatDate(iso: string, loc: string) {
  try {
    return new Intl.DateTimeFormat(loc === "ar" ? "ar-MA" : "fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

type SourceFilter = "all" | ClientSource;

export default function AdminClientsPage() {
  return (
    <RequireAdminAccess permission="clients.view">
      <AdminClientsPageContent />
    </RequireAdminAccess>
  );
}

function AdminClientsPageContent() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const { canAccess } = useAdminRbac();
  const { clients, hydrated, updateClient, removeClient } = useClients();
  const { orders, hydrated: ordersHydrated } = useOrders();
  const { pushToast } = useAdminToast();

  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [detailClient, setDetailClient] = useState<Client | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const orderById = useMemo(() => {
    const m = new Map<string, (typeof orders)[0]>();
    for (const o of orders) m.set(o.id, o);
    return m;
  }, [orders]);

  const stats = useMemo(() => {
    const total = clients.length;
    const fromOrder = clients.filter(
      (c) => c.sources.includes("order") || c.orders.length > 0
    ).length;
    const fromNewsletter = clients.filter((c) =>
      c.sources.includes("newsletter")
    ).length;
    const fromContact = clients.filter((c) =>
      c.sources.includes("contact")
    ).length;
    return { total, fromOrder, fromNewsletter, fromContact };
  }, [clients]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients.filter((c) => {
      if (q) {
        const nameHit =
          c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
        if (!nameHit) return false;
      }
      if (sourceFilter === "all") return true;
      return c.sources.includes(sourceFilter);
    });
  }, [clients, search, sourceFilter]);

  const detailOrders = useMemo(() => {
    if (!detailClient) return [];
    return detailClient.orders
      .map((id) => orderById.get(id))
      .filter((o): o is NonNullable<typeof o> => o != null);
  }, [detailClient, orderById]);

  const detailTotal = useMemo(
    () => detailOrders.reduce((s, o) => s + o.total, 0),
    [detailOrders]
  );

  const handleSaveDetail = useCallback(
    (patch: { name: string; phone: string; address: string }) => {
      if (!detailClient) return;
      const ok = updateClient(detailClient.id, patch);
      if (ok) {
        pushToast(t("toastClientUpdated"), "success");
        setDetailClient((c) =>
          c
            ? {
                ...c,
                name: patch.name.trim(),
                phone: patch.phone.trim(),
                address: patch.address.trim(),
              }
            : null
        );
      }
    },
    [detailClient, updateClient, pushToast, t]
  );

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    removeClient(id);
    pushToast(t("toastClientRemoved"), "success");
    setDetailClient((c) => (c?.id === id ? null : c));
    setPendingDeleteId(null);
  };

  if (!hydrated || !ordersHydrated) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-zinc-200" />
        <div className="h-64 animate-pulse rounded-2xl bg-zinc-200" />
      </div>
    );
  }

  const badgeClass: Record<ClientSource, string> = {
    order: "bg-emerald-100 text-emerald-900",
    contact: "bg-sky-100 text-sky-900",
    newsletter: "bg-amber-100 text-amber-900",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink">{t("clientsTitle")}</h1>
        <p className="mt-2 text-sm text-stone">{t("clientsSubtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title={t("clientsStatTotal")} value={stats.total} />
        <StatCard title={t("clientsStatOrders")} value={stats.fromOrder} />
        <StatCard
          title={t("clientsStatNewsletter")}
          value={stats.fromNewsletter}
        />
        <StatCard title={t("clientsStatContact")} value={stats.fromContact} />
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-[min(100%,240px)] flex-1">
          <label
            htmlFor="clients-search"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone"
          >
            {t("clientsSearchLabel")}
          </label>
          <input
            id="clients-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("clientsSearchPlaceholder")}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-2.5 text-sm focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div className="min-w-[min(100%,200px)] sm:max-w-[220px]">
          <label
            htmlFor="clients-source"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone"
          >
            {t("clientsFilterSource")}
          </label>
          <select
            id="clients-source"
            value={sourceFilter}
            onChange={(e) =>
              setSourceFilter(e.target.value as SourceFilter)
            }
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            <option value="all">{t("clientsFilterAll")}</option>
            <option value="order">{t("clientsSource_order")}</option>
            <option value="contact">{t("clientsSource_contact")}</option>
            <option value="newsletter">{t("clientsSource_newsletter")}</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-stone">
              <tr>
                <th className="px-4 py-3">{t("clientsColName")}</th>
                <th className="px-4 py-3">{t("clientsColEmail")}</th>
                <th className="px-4 py-3">{t("clientsColPhone")}</th>
                <th className="px-4 py-3">{t("clientsColSource")}</th>
                <th className="px-4 py-3">{t("clientsColOrderCount")}</th>
                <th className="px-4 py-3">{t("clientsColDate")}</th>
                <th className="px-4 py-3 text-end">{t("colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-stone"
                  >
                    {t("clientsEmpty")}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="text-ink">
                    <td className="max-w-[160px] px-4 py-3">
                      <span className="line-clamp-2 font-medium">
                        {c.name.trim() || "—"}
                      </span>
                    </td>
                    <td className="max-w-[180px] px-4 py-3">
                      <span className="break-all text-stone">{c.email}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-stone">
                      {c.phone.trim() || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.sources.map((s) => (
                          <span
                            key={s}
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${badgeClass[s]}`}
                          >
                            {t(`clientsSource_${s}`)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{c.orders.length}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-stone text-xs">
                      {formatDate(c.createdAt, locale)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setDetailClient(c)}
                          className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-semibold hover:bg-zinc-50"
                        >
                          {t("clientsViewDetails")}
                        </button>
                        {canAccess("clients.delete") ? (
                          <button
                            type="button"
                            onClick={() => setPendingDeleteId(c.id)}
                            className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                          >
                            {t("delete")}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ClientDetailModal
        client={detailClient}
        open={detailClient !== null}
        orders={detailOrders}
        totalSpentMad={detailTotal}
        onClose={() => setDetailClient(null)}
        onSave={handleSaveDetail}
        formatDate={formatDate}
        allowEdit={canAccess("clients.edit")}
      />

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title={t("clientsDeleteTitle")}
        message={t("clientsDeleteMessage")}
        confirmLabel={t("confirmDelete")}
        cancelLabel={t("cancel")}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
