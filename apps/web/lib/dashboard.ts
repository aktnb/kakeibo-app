import {
  buildJSTMonth,
  createSession,
  getAccounts,
  getCategories,
  getEntries,
  getMonthlyTotals,
  getCategoryBreakdown,
  getAccountBalances,
} from "./api";
import type { DashboardData } from "./types";

export async function getDashboardData(): Promise<DashboardData> {
  const month = buildJSTMonth();
  const from = `${month}-01`;
  const [year, mon] = month.split("-").map(Number);
  const lastDay = new Date(year, mon, 0).getDate();
  const to = `${month}-${String(lastDay).padStart(2, "0")}`;

  const session = await createSession();

  const [accounts, categories, entries, monthlyTotals, categoryBreakdown, accountBalances] =
    await Promise.all([
      getAccounts(),
      getCategories(),
      getEntries({ from, to, pageSize: 20 }),
      getMonthlyTotals(month),
      getCategoryBreakdown(month),
      getAccountBalances(month),
    ]);

  return {
    month,
    source: "api",
    session,
    accounts,
    categories,
    entries,
    monthlyTotals,
    categoryBreakdown,
    accountBalances,
  };
}
