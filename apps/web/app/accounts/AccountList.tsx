"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { archiveAccountAction } from "./actions";
import AccountForm from "./AccountForm";
import { accountTypeLabel } from "../ui/AccountTypeIcon";
import { formatJPY } from "../../lib/formatters";
import type { Account, ActionState } from "../../lib/types";

type Props = {
  accounts: Account[];
};

const IDLE: ActionState<Account> = { status: "idle" };

function AccountMenu({ account, onEdit }: { account: Account; onEdit: () => void }) {
  const [open, setOpen] = useState(false);
  const [, archiveAction, pending] = useActionState(archiveAccountAction, IDLE);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
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
          {!account.isArchived && (
            <button
              type="button"
              onClick={() => { setOpen(false); onEdit(); }}
              className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
            >
              編集
            </button>
          )}
          <form action={archiveAction}>
            <input type="hidden" name="id" value={account.id} />
            <input type="hidden" name="isArchived" value={String(account.isArchived)} />
            <button
              type="submit"
              disabled={pending}
              className={`w-full px-3 py-2 text-left text-xs disabled:opacity-60 ${
                account.isArchived
                  ? "text-green-600 hover:bg-green-50"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {pending ? "..." : account.isArchived ? "復元" : "アーカイブ"}
            </button>
          </form>
        </div>
      )}
    </div>
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
          <p className="mt-0.5 text-xs text-slate-400">{accountTypeLabel(account.type)}</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-base font-bold tabular-nums text-slate-900">
            {formatJPY(account.currentBalance)}
          </p>
          <AccountMenu account={account} onEdit={() => setEditId(account.id)} />
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
        <p className="py-8 text-center text-sm text-slate-400">資産がありません</p>
      )}
    </div>
  );
}
