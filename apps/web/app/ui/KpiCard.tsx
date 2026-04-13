type KpiColor = "default" | "green" | "red";

const kpiValueColor: Record<KpiColor, string> = {
  default: "text-slate-900",
  green: "text-emerald-600",
  red: "text-red-600",
};

export default function KpiCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color: KpiColor;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-2 text-xl font-bold tabular-nums sm:text-2xl lg:text-3xl ${kpiValueColor[color]}`}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
