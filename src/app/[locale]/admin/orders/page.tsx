"use client";

import { useMemo, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { useOrders } from "@/context/orders-context";
import type { Order } from "@/context/orders-context";
import { useAdminToast } from "@/context/admin-toast-context";
import { StatCard } from "@/components/admin/stat-card";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { OrdersStatusChart } from "@/components/admin/orders-status-chart";
import { OrderDetailModal } from "@/components/admin/order-detail-modal";
import {
  countOrdersByStatus,
  getTopProductByQuantity,
} from "@/lib/order-analytics";
import { totalRevenueMad } from "@/lib/admin-stats";
import { exportOrdersToExcel } from "@/lib/order-export-excel";

type Tab = "all" | "pending" | "confirmed";

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

function lineLabel(
  line: { nameFr: string; nameAr: string },
  loc: string
): string {
  return loc === "ar" ? line.nameAr : line.nameFr;
}

export default function AdminOrdersPage() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const { orders, hydrated, confirmOrder } = useOrders();
  const { pushToast } = useAdminToast();
  const [tab, setTab] = useState<Tab>("all");
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const stats = useMemo(() => {
    const { pending, confirmed } = countOrdersByStatus(orders);
    const revenue = totalRevenueMad(orders);
    const top = getTopProductByQuantity(orders);
    return { pending, confirmed, revenue, top };
  }, [orders]);

  const filtered = useMemo(() => {
    if (tab === "pending") {
      return orders.filter((o) => o.status === "pending");
    }
    if (tab === "confirmed") {
      return orders.filter((o) => o.status === "confirmed");
    }
    return orders;
  }, [orders, tab]);

  const handleConfirmFromModal = useCallback(
    (id: string) => {
      confirmOrder(id);
      pushToast(t("toastOrderConfirmed"), "success");
    },
    [confirmOrder, pushToast, t]
  );

  const exportExcel = () => {
    if (orders.length === 0) return;
    exportOrdersToExcel(
      orders,
      "maison-moda-commandes.xlsx",
      {
        id: t("orderExcelColId"),
        client: t("orderExcelColClient"),
        phone: t("orderExcelColPhone"),
        total: t("orderExcelColTotal"),
        status: t("orderExcelColStatus"),
        date: t("orderExcelColDate"),
      },
      (s) =>
        s === "confirmed"
          ? t("orderStatusConfirmed")
          : t("orderStatusPending"),
      (iso) => formatDate(iso, locale)
    );
    pushToast(t("toastExcelExported"), "success");
  };

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
          <h1 className="font-display text-3xl text-ink">{t("ordersTitle")}</h1>
          <p className="mt-2 text-sm text-stone">{t("ordersEmpty")}</p>
        </div>
        <Link
          href="/checkout"
          className="inline-flex rounded-full border border-zinc-200 bg-white px-6 py-2.5 text-sm font-semibold text-ink shadow-sm transition hover:bg-zinc-50"
        >
          {t("testCheckout")}
        </Link>
      </div>
    );
  }

  const topName =
    stats.top == null
      ? t("orderStatTopEmpty")
      : lineLabel(
          { nameFr: stats.top.nameFr, nameAr: stats.top.nameAr },
          locale
        );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">{t("ordersTitle")}</h1>
          <p className="mt-2 text-sm text-stone">
            {t("ordersCount", { count: orders.length })}
          </p>
        </div>
        <button
          type="button"
          onClick={exportExcel}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-ink transition hover:bg-accent/90"
        >
          {t("orderExportExcel")}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title={t("orderStatTotal")} value={orders.length} />
        <StatCard title={t("orderStatConfirmed")} value={stats.confirmed} />
        <StatCard
          title={t("orderStatRevenue")}
          value={stats.revenue}
          hint="MAD"
        />
        <StatCard
          title={t("orderStatTopProduct")}
          value={stats.top ? stats.top.quantity : "—"}
          hint={topName}
        />
      </div>

      <OrdersStatusChart
        pending={stats.pending}
        confirmed={stats.confirmed}
        labelPending={t("orderStatusPending")}
        labelConfirmed={t("orderStatusConfirmed")}
        title={t("orderChartTitle")}
      />

      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label={t("ordersTitle")}
      >
        {(
          [
            ["all", "ordersTabAll"],
            ["pending", "ordersTabPending"],
            ["confirmed", "ordersTabConfirmed"],
          ] as const
        ).map(([key, labelKey]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              tab === key
                ? "bg-ink text-white"
                : "bg-zinc-100 text-ink hover:bg-zinc-200"
            }`}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/80 px-6 py-12 text-center text-sm text-stone">
          {t("ordersTabEmpty")}
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-stone">
                <tr>
                  <th className="px-4 py-3">{t("orderColId")}</th>
                  <th className="px-4 py-3">{t("orderColClient")}</th>
                  <th className="px-4 py-3">{t("orderColPhone")}</th>
                  <th className="px-4 py-3">{t("orderColTotal")}</th>
                  <th className="px-4 py-3">{t("orderColStatus")}</th>
                  <th className="px-4 py-3">{t("orderColDate")}</th>
                  <th className="px-4 py-3 text-end">{t("colActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.map((order) => (
                  <tr key={order.id} className="text-ink">
                    <td className="px-4 py-3 font-mono text-xs">{order.id}</td>
                    <td className="max-w-[160px] px-4 py-3">
                      <span className="line-clamp-2 font-medium">
                        {order.customerName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone">
                      {order.phone ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium tabular-nums">
                      {order.total} MAD
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge
                        status={order.status}
                        labelPending={t("orderStatusPending")}
                        labelConfirmed={t("orderStatusConfirmed")}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-stone">
                      {formatDate(order.date, locale)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setDetailOrder(order)}
                          className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold transition hover:bg-zinc-50"
                        >
                          {t("orderViewDetails")}
                        </button>
                        {order.status === "pending" ? (
                          <button
                            type="button"
                            onClick={() => handleConfirmFromModal(order.id)}
                            className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                          >
                            {t("orderConfirm")}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <OrderDetailModal
        order={detailOrder}
        open={detailOrder !== null}
        onClose={() => setDetailOrder(null)}
        onConfirm={handleConfirmFromModal}
        formatDate={formatDate}
        lineLabel={lineLabel}
      />
    </div>
  );
}
