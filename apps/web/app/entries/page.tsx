import { getAccounts, getCategories, getEntries } from "../../lib/api";
import type { Account, Category, Entry } from "../../lib/types";
import EntryForm from "./EntryForm";
import EntryList from "./EntryList";

function buildJSTMonth(): string {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export default async function EntriesPage() {
  const month = buildJSTMonth();
  const from = `${month}-01`;
  const to = `${month}-31`;

  let accounts: Account[] = [];
  let categories: Category[] = [];
  let entries: Entry[] = [];
  let apiError = false;

  try {
    [accounts, categories, entries] = await Promise.all([
      getAccounts(),
      getCategories(),
      getEntries({ from, to, pageSize: 100 }),
    ]);
  } catch {
    apiError = true;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <h1 className="text-lg font-bold tracking-tight text-slate-900">収支</h1>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-4 p-4 sm:p-6">
        {apiError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            API に接続できません。<code className="mx-1 rounded bg-amber-100 px-1 text-xs">make dev</code> で API を起動してください。
          </div>
        )}

        {/* 入力フォーム */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">新規登録</h2>
          <EntryForm accounts={accounts} categories={categories} />
        </section>

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
