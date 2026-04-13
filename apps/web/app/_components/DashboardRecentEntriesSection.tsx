import { formatJPY, formatDateTime } from "../../lib/formatters";
import type { Account, Category, Entry } from "../../lib/types";

type Props = {
  entries: Entry[];
  categoriesById: Map<string, Category>;
  accountsById: Map<string, Account>;
};

export default function DashboardRecentEntriesSection({ entries, categoriesById, accountsById }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          直近の収支
        </h2>
        <span className="text-xs text-slate-400">{entries.length}件</span>
      </div>
      <div className="divide-y divide-slate-100">
        {entries.map((entry) => {
          const category = categoriesById.get(entry.categoryId);
          const account = accountsById.get(entry.accountId);
          const isIncome = entry.type === "income";
          const dotColor = category?.color ?? (isIncome ? "#16a34a" : "#ef4444");
          return (
            <div
              key={entry.id}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: dotColor }}
                >
                  {(category?.name ?? "？")[0]}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {category?.name ?? "未分類"}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {formatDateTime(entry.occurredOn)}・{account?.name ?? "不明な口座"}
                    {entry.memo ? `・${entry.memo}` : ""}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-base font-bold tabular-nums ${
                    isIncome ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isIncome ? "+" : "−"}{formatJPY(entry.amount)}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {isIncome ? "収入" : "支出"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
