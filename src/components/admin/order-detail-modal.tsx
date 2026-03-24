"use client";

import { useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { Order } from "@/context/orders-context";
import { downloadOrderPdf, type OrderPdfCopy } from "@/lib/order-export-pdf";
import { useAdminToast } from "@/context/admin-toast-context";
import { useAdminClickLog } from "@/hooks/use-admin-click-log";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";

type Props = {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  formatDate: (iso: string, loc: string) => string;
  lineLabel: (
    line: { nameFr: string; nameAr: string },
    loc: string
  ) => string;
  /** Si false, le bouton « Confirmer » est masqué (RBAC). Défaut : true */
  allowConfirm?: boolean;
};

export function OrderDetailModal({
  order,
  open,
  onClose,
  onConfirm,
  formatDate,
  lineLabel,
  allowConfirm = true,
}: Props) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const { pushToast } = useAdminToast();
  const { logClick } = useAdminClickLog();

  const closeModal = useCallback(
    (via: "button" | "backdrop") => {
      if (order) {
        logClick(
          via === "backdrop"
            ? "CLICK_ORDER_MODAL_BACKDROP"
            : "CLICK_ORDER_MODAL_CLOSE",
          "order",
          `id=${order.id}`
        );
      }
      onClose();
    },
    [order, logClick, onClose]
  );

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal("button");
    },
    [closeModal]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prev;
    };
  }, [open, handleKey]);

  if (!open || !order) return null;

  const pdfCopy: OrderPdfCopy = {
    docTitle: t("orderPdfTitle"),
    orderId: t("orderPdfId"),
    client: t("orderClient"),
    email: t("orderPdfEmail"),
    phone: t("orderPdfPhone"),
    address: t("orderPdfAddress"),
    city: t("orderPdfCity"),
    itemsTitle: t("orderItems"),
    total: t("orderTotal"),
    date: t("orderPdfDate"),
    qty: t("orderPdfQty"),
    size: t("orderPdfSize"),
    unitShort: t("orderPdfUnitShort"),
  };

  const handlePdf = async () => {
    logClick("CLICK_ORDER_MODAL_PDF", "order", `id=${order.id}`);
    try {
      await downloadOrderPdf(order, pdfCopy, locale, (iso) =>
        formatDate(iso, locale)
      );
      pushToast(t("toastPdfDownloaded"), "success");
    } catch {
      pushToast(t("toastPdfError"), "error");
    }
  };

  const handleConfirm = () => {
    if (order.status !== "pending") return;
    logClick("CLICK_ORDER_MODAL_CONFIRM", "order", `id=${order.id}`);
    onConfirm(order.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]"
        aria-label={t("orderModalClose")}
        onClick={() => closeModal("backdrop")}
      />
      <div className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl sm:max-w-xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-zinc-100 bg-zinc-50 px-5 py-4">
          <div>
            <h2
              id="order-modal-title"
              className="font-display text-lg text-ink sm:text-xl"
            >
              {t("orderModalTitle")}
            </h2>
            <p className="mt-1 font-mono text-xs text-stone">{order.id}</p>
            <div className="mt-2">
              <OrderStatusBadge
                status={order.status}
                labelPending={t("orderStatusPending")}
                labelConfirmed={t("orderStatusConfirmed")}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => closeModal("button")}
            className="rounded-full p-2 text-stone transition hover:bg-zinc-200 hover:text-ink"
            aria-label={t("orderModalClose")}
          >
            <span className="text-lg leading-none">×</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <section className="space-y-1 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone">
              {t("orderClient")}
            </p>
            <p className="font-medium text-ink">{order.customerName}</p>
            <p>
              <a
                href={`mailto:${order.email}`}
                className="text-accent underline-offset-2 hover:underline"
              >
                {order.email}
              </a>
            </p>
            <p className="text-stone">{order.phone ?? "—"}</p>
            <p className="text-stone">{order.address}</p>
            {order.city ? <p className="text-stone">{order.city}</p> : null}
          </section>

          <p className="mt-4 text-xs text-stone">
            {t("orderPdfDate")}: {formatDate(order.date, locale)}
          </p>

          <section className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone">
              {t("orderItems")}
            </h3>
            <ul className="mt-3 space-y-3">
              {order.items.map((line) => (
                <li
                  key={`${line.productId}-${line.size}`}
                  className="flex justify-between gap-3 border-b border-zinc-100 pb-3 text-sm last:border-0"
                >
                  <span className="min-w-0">
                    <span className="font-medium text-ink">
                      {lineLabel(line, locale)}
                    </span>
                    <span className="mt-0.5 block text-xs text-stone">
                      {t("orderPdfQty")}: {line.quantity} · {line.size} ·{" "}
                      {line.unitPriceMad} MAD/{t("orderPdfUnitShort")}
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-ink">
                    {line.lineTotalMad} MAD
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-6 flex items-center justify-between rounded-xl bg-accent/15 px-4 py-3">
            <span className="text-sm font-semibold text-ink">
              {t("orderTotal")}
            </span>
            <span className="font-display text-xl text-ink">
              {order.total} MAD
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 border-t border-zinc-100 bg-white px-5 py-4">
          <button
            type="button"
            onClick={handlePdf}
            className="rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-zinc-50"
          >
            {t("orderDownloadPdf")}
          </button>
          {allowConfirm && order.status === "pending" ? (
            <button
              type="button"
              onClick={handleConfirm}
              className="rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              {t("orderConfirm")}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => closeModal("button")}
            className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90"
          >
            {t("orderModalClose")}
          </button>
        </div>
      </div>
    </div>
  );
}
