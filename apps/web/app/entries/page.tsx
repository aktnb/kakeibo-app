import { buildJSTMonth, createSession, getAccounts, getCategories, getEntries } from "../../lib/api";
import type { Account, Category, Entry } from "../../lib/types";
import EntryList from "./EntryList";

export default async function EntriesPage() {
  const month = buildJSTMonth();
  const from = `${month}-01`;
  const [year, mon] = month.split("-").map(Number);
  const lastDay = new Date(year, mon, 0).getDate();
  const to = `${month}-${String(lastDay).padStart(2, "0")}`;

  let accounts: Account[] = [];
  let categories: Category[] = [];
  let entries: Entry[] = [];
  let apiError = false;

  try {
    await createSession();
    [accounts, categories, entries] = await Promise.all([
      getAccounts(),
      getCategories(),
      getEntries({ from, to, pageSize: 100 }),
    ]);
  } catch {
    apiError = true;
  }

  // accounts, categories は EntryList での表示名解決に使用

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-4 p-4 sm:p-6">
        <h1 className="text-xl font-bold text-slate-900">収支</h1>
        {apiError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            API に接続できません。<code className="mx-1 rounded bg-amber-100 px-1 text-xs">make dev</code> で API を起動してください。
          </div>
        )}

        {/* 一覧 */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              今月の収支
            </h2>
            <span className="text-xs text-slate-400">{entries.length}件</span>
          </div>
          <EntryList entries={entries} accounts={accounts} categories={categories} />
        </section>
      </div>
    </div>
  );
}
