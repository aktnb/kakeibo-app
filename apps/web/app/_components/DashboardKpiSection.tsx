import KpiCard from "../ui/KpiCard";
import { formatJPY, signedJPY } from "../../lib/formatters";
import type { AccountBalances, MonthlyTotals } from "../../lib/types";

type Props = {
  monthlyTotals: MonthlyTotals;
  accountBalances: AccountBalances;
};

export default function DashboardKpiSection({ monthlyTotals, accountBalances }: Props) {
  const net = monthlyTotals.net;
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <KpiCard
        label="総残高"
        value={formatJPY(accountBalances.totalClosingBalance)}
        color="default"
      />
      <KpiCard
        label="今月の収入"
        value={formatJPY(monthlyTotals.income)}
        color="green"
      />
      <KpiCard
        label="今月の支出"
        value={formatJPY(monthlyTotals.expense)}
        color="red"
      />
      <KpiCard
        label="収支"
        value={signedJPY(net)}
        sub={`${monthlyTotals.entryCount}件の記録`}
        color={net >= 0 ? "green" : "red"}
      />
    </div>
  );
}
