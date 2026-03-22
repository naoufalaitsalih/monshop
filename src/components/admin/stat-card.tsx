type Props = {
  title: string;
  value: string | number;
  hint?: string;
};

export function StatCard({ title, value, hint }: Props) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone">
        {title}
      </p>
      <p className="mt-2 font-display text-3xl text-ink">{value}</p>
      {hint ? <p className="mt-2 text-sm text-stone">{hint}</p> : null}
    </div>
  );
}
