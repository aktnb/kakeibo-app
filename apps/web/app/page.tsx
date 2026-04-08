import { getDashboardData } from "../lib/api";

function formatJPY(value: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  return `${year}年${parseInt(m)}月`;
}

function signedJPY(value: number): string {
  return (value >= 0 ? "+" : "") + formatJPY(value);
}

export default async function Home() {
  const data = await getDashboardData();
  const categoriesById = new Map(data.categories.map((c) => [c.id, c]));
  const accountsById = new Map(data.accounts.map((a) => [a.id, a]));
  const net = data.monthlyTotals.net;

  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">残高の森</h1>
            {data.source === "mock" && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                モック
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-400">{data.session.household.name}</span>
            <span className="font-semibold text-slate-700">{formatMonth(data.month)}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">

        {/* KPIカード */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <KpiCard
            label="総残高"
            value={formatJPY(data.accountBalances.totalClosingBalance)}
            color="blue"
          />
          <KpiCard
            label="今月の収入"
            value={formatJPY(data.monthlyTotals.income)}
            color="green"
          />
          <KpiCard
            label="今月の支出"
            value={formatJPY(data.monthlyTotals.expense)}
            color="red"
          />
          <KpiCard
            label="収支"
            value={signedJPY(net)}
            sub={`${data.monthlyTotals.entryCount}件の記録`}
            color={net >= 0 ? "green" : "red"}
          />
        </div>

        {/* 口座残高 + 支出内訳 */}
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">

          {/* 口座残高 */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
              口座残高
            </h2>
            <div className="space-y-2">
              {data.accountBalances.items.map((account) => {
                const delta = account.delta;
                return (
                  <div
                    key={account.accountID}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <AccountTypeIcon type={account.accountType} />
                      <div>
                        <p className="font-semibold text-slate-800">{account.accountName}</p>
                        <p className="mt-0.5 text-xs text-slate-400">{accountTypeLabel(account.accountType)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold tabular-nums text-slate-900">
                        {formatJPY(account.closingBalance)}
                      </p>
                      <p
                        className={`mt-0.5 text-xs font-semibold tabular-nums ${
                          delta >= 0 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {signedJPY(delta)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 支出内訳 */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                支出内訳
              </h2>
              <span className="text-sm font-bold tabular-nums text-red-600">
                {formatJPY(data.categoryBreakdown.total)}
              </span>
            </div>
            <div className="space-y-4">
              {data.categoryBreakdown.items.map((item) => {
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
        </div>

        {/* 収支明細 */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              直近の収支
            </h2>
            <span className="text-xs text-slate-400">{data.entries.length}件</span>
          </div>
          <div className="divide-y divide-slate-100">
            {data.entries.map((entry) => {
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
                        {entry.occurredOn}・{account?.name ?? "不明な口座"}
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
      </div>
    </div>
  );
}

// --- KPIカード ---

type KpiColor = "blue" | "green" | "red";

const kpiValueColor: Record<KpiColor, string> = {
  blue: "text-blue-700",
  green: "text-emerald-600",
  red: "text-red-600",
};

function KpiCard({
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

// --- 口座タイプ ---

function accountTypeLabel(type: string): string {
  if (type === "bank") return "銀行口座";
  if (type === "cash") return "現金";
  if (type === "credit") return "クレジット";
  if (type === "ewallet") return "電子マネー";
  return type;
}

function AccountTypeIcon({ type }: { type: string }) {
  const configs: Record<string, { bg: string; text: string; char: string }> = {
    bank: { bg: "bg-blue-100", text: "text-blue-600", char: "銀" },
    cash: { bg: "bg-amber-100", text: "text-amber-600", char: "現" },
    credit: { bg: "bg-purple-100", text: "text-purple-600", char: "カ" },
    ewallet: { bg: "bg-green-100", text: "text-green-600", char: "電" },
  };
  const c = configs[type] ?? { bg: "bg-slate-100", text: "text-slate-500", char: "他" };
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${c.bg} ${c.text}`}
    >
      {c.char}
    </span>
  );
}
