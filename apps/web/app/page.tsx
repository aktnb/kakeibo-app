import { getDashboardData } from "../lib/dashboard";
import { getMockDashboardData } from "../lib/mock-data";
import { formatMonth } from "../lib/formatters";
import type { DashboardData } from "../lib/types";
import DashboardKpiSection from "./_components/DashboardKpiSection";
import DashboardAccountsSection from "./_components/DashboardAccountsSection";
import DashboardCategorySection from "./_components/DashboardCategorySection";
import DashboardRecentEntriesSection from "./_components/DashboardRecentEntriesSection";

export default async function Home() {
  let data: DashboardData;
  try {
    data = await getDashboardData();
  } catch {
    data = getMockDashboardData();
  }

  const categoriesById = new Map(data.categories.map((c) => [c.id, c]));
  const accountsById = new Map(data.accounts.map((a) => [a.id, a]));

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-700">{formatMonth(data.month)}</span>
            <span className="text-slate-300">·</span>
            <span className="text-sm text-slate-400">{data.session.household.name}</span>
            {data.source === "mock" && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                モック
              </span>
            )}
          </div>
        </div>

        <DashboardKpiSection
          monthlyTotals={data.monthlyTotals}
          accountBalances={data.accountBalances}
        />

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <DashboardAccountsSection accountBalances={data.accountBalances} />
          <DashboardCategorySection
            categoryBreakdown={data.categoryBreakdown}
            categoriesById={categoriesById}
          />
        </div>

        <DashboardRecentEntriesSection
          entries={data.entries}
          categoriesById={categoriesById}
          accountsById={accountsById}
        />
      </div>
    </div>
  );
}
