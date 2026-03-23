import type { OrderStatus } from "@/context/orders-context";

type Props = {
  status: OrderStatus;
  labelPending: string;
  labelConfirmed: string;
};

export function OrderStatusBadge({
  status,
  labelPending,
  labelConfirmed,
}: Props) {
  const isConfirmed = status === "confirmed";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
        isConfirmed
          ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200"
          : "bg-amber-100 text-amber-900 ring-1 ring-amber-200"
      }`}
    >
      {isConfirmed ? labelConfirmed : labelPending}
    </span>
  );
}
