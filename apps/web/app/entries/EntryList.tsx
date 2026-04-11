"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { deleteEntryAction } from "./actions";
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

function EntryMenu({ entry, onEdit }: { entry: Entry; onEdit: () => void }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [, deleteAction, pending] = useActionState(deleteEntryAction, IDLE);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirming(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
        aria-label="メニュー"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-10 w-28 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {confirming ? (
            <form action={deleteAction}>
              <input type="hidden" name="id" value={entry.id} />
              <p className="px-3 py-2 text-xs text-slate-500">削除しますか？</p>
              <button
                type="submit"
                disabled={pending}
                className="w-full px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                {pending ? "削除中..." : "削除する"}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="w-full px-3 py-2 text-left text-xs text-slate-500 hover:bg-slate-50"
              >
                戻る
              </button>
            </form>
          ) : (
            <>
              <button
                type="button"
                onClick={() => { setOpen(false); onEdit(); }}
                className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
              >
                編集
              </button>
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50"
              >
                削除
              </button>
            </>
          )}
        </div>
      )}
    </div>
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
                <p className={`text-base font-bold tabular-nums ${isIncome ? "text-green-600" : "text-red-600"}`}>
                  {isIncome ? "+" : "−"}{formatJPY(entry.amount)}
                </p>
                <EntryMenu entry={entry} onEdit={() => setEditId(entry.id)} />
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
