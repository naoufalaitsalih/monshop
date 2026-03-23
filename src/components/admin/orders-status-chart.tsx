"use client";

type Props = {
  pending: number;
  confirmed: number;
  labelPending: string;
  labelConfirmed: string;
  title: string;
};

export function OrdersStatusChart({
  pending,
  confirmed,
  labelPending,
  labelConfirmed,
  title,
}: Props) {
  const total = Math.max(1, pending + confirmed);
  const pPct = (pending / total) * 100;
  const cPct = (confirmed / total) * 100;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone">
        {title}
      </p>
      <div className="mt-4 flex h-4 overflow-hidden rounded-full bg-zinc-100">
        {pending > 0 ? (
          <div
            className="bg-amber-400 transition-all"
            style={{ width: `${pPct}%` }}
            title={labelPending}
          />
        ) : null}
        {confirmed > 0 ? (
          <div
            className="bg-emerald-500 transition-all"
            style={{ width: `${cPct}%` }}
            title={labelConfirmed}
          />
        ) : null}
      </div>
      <ul className="mt-4 flex flex-wrap gap-4 text-sm">
        <li className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-amber-400" aria-hidden />
          <span className="text-stone">
            {labelPending}: <strong className="text-ink">{pending}</strong>
          </span>
        </li>
        <li className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-emerald-500" aria-hidden />
          <span className="text-stone">
            {labelConfirmed}: <strong className="text-ink">{confirmed}</strong>
          </span>
        </li>
      </ul>
    </div>
  );
}
