"use client";

import { useActionState, useState } from "react";
import { deleteEntryAction, updateEntryAction } from "./actions";
import EntryForm from "./EntryForm";
import type { Account, ActionState, Category, Entry } from "../../lib/types";

type Props = {
  entries: Entry[];
  accounts: Account[];
  categories: Category[];
};

function formatJPY(value: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(rfc3339: string): string {
  const d = new Date(rfc3339);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${day} ${h}:${min}`;
}

const IDLE: ActionState = { status: "idle" };

function DeleteButton({ entryId }: { entryId: string }) {
  const [state, formAction, pending] = useActionState(deleteEntryAction, IDLE);
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <form action={formAction} className="flex gap-1">
        <input type="hidden" name="id" value={entryId} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-red-500 px-2 py-1 text-xs font-semibold text-white disabled:opacity-60"
        >
          {pending ? "削除中" : "確認"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500"
        >
          戻る
        </button>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:border-red-200 hover:text-red-500"
    >
      削除
    </button>
  );
}

export default function EntryList({ entries, accounts, categories }: Props) {
  const [editId, setEditId] = useState<string | null>(null);
  const categoriesById = new Map(categories.map((c) => [c.id, c]));
  const accountsById = new Map(accounts.map((a) => [a.id, a]));

  if (entries.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">まだ収支がありません</p>
    );
  }

  const editEntry = entries.find((e) => e.id === editId) ?? null;

  return (
    <>
      <div className="divide-y divide-slate-100">
        {entries.map((entry) => {
          const category = categoriesById.get(entry.categoryId);
          const account = accountsById.get(entry.accountId);
          const isIncome = entry.type === "income";
          const dotColor = category?.color ?? (isIncome ? "#16a34a" : "#ef4444");

          return (
            <div key={entry.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
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
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className={`text-base font-bold tabular-nums ${isIncome ? "text-green-600" : "text-red-600"}`}>
                    {isIncome ? "+" : "−"}{formatJPY(entry.amount)}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => setEditId(entry.id)}
                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-slate-50"
                  >
                    編集
                  </button>
                  <DeleteButton entryId={entry.id} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 編集モーダル */}
      {editEntry && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setEditId(null)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">収支を編集</h2>
              <button
                onClick={() => setEditId(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
                aria-label="閉じる"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <EntryForm
              accounts={accounts}
              categories={categories}
              editTarget={editEntry}
              onCancel={() => setEditId(null)}
            />
          </div>
        </>
      )}
    </>
  );
}
