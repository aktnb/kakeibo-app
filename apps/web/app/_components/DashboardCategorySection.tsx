import { formatJPY } from "../../lib/formatters";
import type { Category, CategoryBreakdown } from "../../lib/types";

type Props = {
  categoryBreakdown: CategoryBreakdown;
  categoriesById: Map<string, Category>;
};

export default function DashboardCategorySection({ categoryBreakdown, categoriesById }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          支出内訳
        </h2>
        <span className="text-sm font-bold tabular-nums text-red-600">
          {formatJPY(categoryBreakdown.total)}
        </span>
      </div>
      <div className="space-y-4">
        {categoryBreakdown.items.map((item) => {
          const category = categoriesById.get(item.categoryID);
          const barColor = category?.color ?? "#ef4444";
          const pct = Math.round(item.ratio * 100);
          return (
            <div key={item.categoryID}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: barColor }}
                  />
                  <span className="text-sm font-medium text-slate-700">{item.categoryName}</span>
                </div>
                <span className="text-sm font-semibold tabular-nums text-slate-800">
                  {formatJPY(item.amount)}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.max(pct, 3)}%`,
                    backgroundColor: barColor,
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {pct}%・{item.transactionCount}件
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
