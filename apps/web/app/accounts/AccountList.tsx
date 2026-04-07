"use client";

import { useActionState, useState } from "react";
import { archiveAccountAction } from "./actions";
import AccountForm from "./AccountForm";
import type { Account, ActionState } from "../../lib/types";

type Props = {
  accounts: Account[];
};

function formatJPY(value: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);
}

const typeLabel: Record<string, string> = {
  bank: "銀行口座",
  cash: "現金",
  credit: "クレジット",
};

const IDLE: ActionState<Account> = { status: "idle" };

function ArchiveButton({ account }: { account: Account }) {
  const [state, formAction, pending] = useActionState(archiveAccountAction, IDLE);
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={account.id} />
      <input type="hidden" name="isArchived" value={String(account.isArchived)} />
      <button
        type="submit"
        disabled={pending}
        className={`rounded-lg border px-2 py-1 text-xs font-medium disabled:opacity-60 ${
          account.isArchived
            ? "border-green-200 text-green-600 hover:bg-green-50"
            : "border-slate-200 text-slate-500 hover:bg-slate-50"
        }`}
      >
        {pending ? "..." : account.isArchived ? "復元" : "アーカイブ"}
      </button>
    </form>
  );
}

export default function AccountList({ accounts }: Props) {
  const [editId, setEditId] = useState<string | null>(null);
  const active = accounts.filter((a) => !a.isArchived);
  const archived = accounts.filter((a) => a.isArchived);

  const renderAccount = (account: Account) => {
    if (editId === account.id) {
      return (
        <div key={account.id} className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <AccountForm editTarget={account} onCancel={() => setEditId(null)} />
        </div>
      );
    }

    return (
      <div
        key={account.id}
        className={`flex items-center justify-between rounded-xl px-4 py-3 ${
          account.isArchived ? "bg-slate-50 opacity-60" : "bg-slate-50"
        }`}
      >
        <div>
          <p className="font-semibold text-slate-800">{account.name}</p>
          <p className="mt-0.5 text-xs text-slate-400">{typeLabel[account.type] ?? account.type}</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-base font-bold tabular-nums text-slate-900">
            {formatJPY(account.currentBalance)}
          </p>
          {!account.isArchived && (
            <button
              type="button"
              onClick={() => setEditId(account.id)}
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-white"
            >
              編集
            </button>
          )}
          <ArchiveButton account={account} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {active.map(renderAccount)}
      {archived.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-600">
            アーカイブ済み（{archived.length}件）
          </summary>
          <div className="mt-2 space-y-2">{archived.map(renderAccount)}</div>
        </details>
      )}
      {accounts.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-400">口座がありません</p>
      )}
    </div>
  );
}
