import AccountTypeIcon, { accountTypeLabel } from "../ui/AccountTypeIcon";
import { formatJPY, signedJPY } from "../../lib/formatters";
import type { AccountBalances } from "../../lib/types";

export default function DashboardAccountsSection({ accountBalances }: { accountBalances: AccountBalances }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
        資産残高
      </h2>
      <div className="space-y-2">
        {accountBalances.items.map((account) => {
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
  );
}
