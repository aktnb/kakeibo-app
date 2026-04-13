import { createSession, getAccounts } from "../../lib/api";
import type { Account } from "../../lib/types";
import AccountForm from "./AccountForm";
import AccountList from "./AccountList";

export default async function AccountsPage() {
  let accounts: Account[] = [];
  let apiError = false;

  try {
    await createSession();
    accounts = await getAccounts(true);
  } catch {
    apiError = true;
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-4 p-4 sm:p-6">
        <h1 className="text-xl font-bold text-slate-900">資産</h1>
        {apiError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            API に接続できません。<code className="mx-1 rounded bg-amber-100 px-1 text-xs">make dev</code> で API を起動してください。
          </div>
        )}

        {/* 追加フォーム */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">資産を追加</h2>
          <AccountForm />
        </section>

        {/* 一覧 */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">資産一覧</h2>
            <span className="text-xs text-slate-400">{accounts.filter((a) => !a.isArchived).length}件</span>
          </div>
          <AccountList accounts={accounts} />
        </section>
      </div>
    </div>
  );
}
