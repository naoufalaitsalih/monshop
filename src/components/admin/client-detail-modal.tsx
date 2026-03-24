"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAdminClickLog } from "@/hooks/use-admin-click-log";
import { Link } from "@/i18n/routing";
import type { Client } from "@/context/clients-context";
import type { Order } from "@/context/orders-context";

type Props = {
  client: Client | null;
  open: boolean;
  orders: Order[];
  totalSpentMad: number;
  onClose: () => void;
  onSave: (patch: { name: string; phone: string; address: string }) => void;
  formatDate: (iso: string, loc: string) => string;
  allowEdit?: boolean;
};

export function ClientDetailModal({
  client,
  open,
  orders,
  totalSpentMad,
  onClose,
  onSave,
  formatDate,
  allowEdit = true,
}: Props) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const { logClick } = useAdminClickLog();

  const closeModal = useCallback(
    (via: "button" | "backdrop") => {
      if (client) {
        logClick(
          via === "backdrop"
            ? "CLICK_CLIENT_MODAL_BACKDROP"
            : "CLICK_CLIENT_MODAL_CLOSE",
          "client",
          `id=${client.id}`
        );
      }
      onClose();
    },
    [client, logClick, onClose]
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!client) return;
    setName(client.name);
    setPhone(client.phone);
    setAddress(client.address);
  }, [client]);

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

  if (!open || !client) return null;

  const badgeClass: Record<string, string> = {
    order: "bg-emerald-100 text-emerald-900",
    contact: "bg-sky-100 text-sky-900",
    newsletter: "bg-amber-100 text-amber-900",
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        aria-label={t("clientsModalClose")}
        onClick={() => closeModal("backdrop")}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-modal-title"
        className="relative z-10 flex max-h-[min(92vh,720px)] w-full max-w-lg flex-col rounded-t-2xl border border-zinc-200 bg-white shadow-2xl sm:max-h-[85vh] sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-4 sm:px-6">
          <h2
            id="client-modal-title"
            className="font-display text-xl text-ink sm:text-2xl"
          >
            {t("clientsModalTitle")}
          </h2>
          <button
            type="button"
            onClick={() => closeModal("button")}
            className="rounded-lg p-2 text-stone hover:bg-zinc-100"
            aria-label={t("clientsModalClose")}
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          <div className="flex flex-wrap gap-1.5">
            {client.sources.map((s) => (
              <span
                key={s}
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badgeClass[s] ?? "bg-zinc-100 text-zinc-800"}`}
              >
                {t(`clientsSource_${s}`)}
              </span>
            ))}
          </div>

          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-stone">
                {t("clientsColEmail")}
              </dt>
              <dd className="mt-0.5 font-medium text-ink">{client.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-stone">
                {t("clientsColDate")}
              </dt>
              <dd className="mt-0.5 text-ink">
                {formatDate(client.createdAt, locale)}
              </dd>
            </div>
          </dl>

          {allowEdit ? (
            <div className="mt-6 rounded-xl border border-zinc-100 bg-zinc-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone">
                {t("clientsEditSection")}
              </p>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone">
                    {t("clientsColName")}
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone">
                    {t("clientsColPhone")}
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone">
                    {t("clientsColAddress")}
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logClick(
                      "CLICK_CLIENT_MODAL_SAVE",
                      "client",
                      `id=${client.id}`
                    );
                    onSave({ name, phone, address });
                  }}
                  className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white hover:bg-ink/90"
                >
                  {t("clientsSave")}
                </button>
              </div>
            </div>
          ) : (
            <dl className="mt-6 space-y-2 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase text-stone">
                  {t("clientsColName")}
                </dt>
                <dd>{name || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-stone">
                  {t("clientsColPhone")}
                </dt>
                <dd>{phone || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-stone">
                  {t("clientsColAddress")}
                </dt>
                <dd className="whitespace-pre-wrap">{address || "—"}</dd>
              </div>
            </dl>
          )}

          <div className="mt-6 rounded-xl border border-accent/20 bg-accent/5 p-4">
            <p className="text-sm font-semibold text-ink">
              {t("clientsTotalSpent")}{" "}
              <span className="text-accent">{totalSpentMad} MAD</span>
            </p>
            <p className="mt-1 text-xs text-stone">
              {t("clientsOrdersCount", { count: orders.length })}
            </p>
          </div>

          {orders.length > 0 ? (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone">
                {t("clientsOrdersList")}
              </p>
              <ul className="mt-3 space-y-2">
                {orders.map((o) => (
                  <li
                    key={o.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-100 bg-white px-3 py-2 text-sm"
                  >
                    <span className="font-mono text-xs text-stone">{o.id}</span>
                    <span className="font-medium">{o.total} MAD</span>
                    <span className="text-xs text-stone">
                      {formatDate(o.date, locale)}
                    </span>
                    <Link
                      href="/admin/orders"
                      onClick={() =>
                        logClick(
                          "CLICK_CLIENT_SEE_ORDERS_LINK",
                          "client",
                          `order=${o.id}`
                        )
                      }
                      className="text-xs font-semibold text-accent underline-offset-2 hover:underline"
                    >
                      {t("clientsSeeOrders")}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-6 text-sm text-stone">{t("clientsNoOrders")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
