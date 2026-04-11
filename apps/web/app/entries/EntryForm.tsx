"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { createEntryAction, updateEntryAction } from "./actions";
import type { Account, ActionState, Category, Entry } from "../../lib/types";

type Props = {
  accounts: Account[];
  categories: Category[];
  editTarget?: Entry | null;
  onCancel?: () => void;
  onSuccess?: () => void;
};

const IDLE: ActionState<Entry> = { status: "idle" };

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function nowLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function rfc3339ToDatetimeLocal(rfc3339: string): string {
  const d = new Date(rfc3339);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EntryForm({ accounts, categories, editTarget, onCancel, onSuccess }: Props) {
  const isEdit = !!editTarget;
  const action = isEdit ? updateEntryAction : createEntryAction;
  const [state, formAction, pending] = useActionState(action, IDLE);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success" && !isEdit) {
      formRef.current?.reset();
      onSuccess?.();
    }
  }, [state, isEdit, onSuccess]);

  const defaultType = editTarget?.type ?? "expense";
  const [selectedType, setSelectedType] = useState<"income" | "expense">(defaultType);
  const incomeCategories = categories.filter((c) => c.kind === "income" && !c.isArchived);
  const expenseCategories = categories.filter((c) => c.kind === "expense" && !c.isArchived);
  const filteredCategories = selectedType === "income" ? incomeCategories : expenseCategories;
  const activeAccounts = accounts.filter((a) => !a.isArchived);

  // onSubmit でブラウザ側（クライアント）で datetime-local → RFC3339 に変換する。
  // Server Action 内では new Date() がサーバーの UTC で動くため、
  // ブラウザのタイムゾーンを正確に反映できない。
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = fd.get("occurredOn") as string;
    if (raw) {
      // ブラウザで実行されるので、new Date(raw) はローカル時刻として解釈される
      fd.set("occurredOn", new Date(raw).toISOString());
    }
    startTransition(() => formAction(fd));
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {isEdit && <input type="hidden" name="id" value={editTarget.id} />}

      {/* 収支種別 */}
      <div className="flex gap-2">
        {(["expense", "income"] as const).map((t) => (
          <label
            key={t}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 has-[:checked]:text-blue-700"
          >
            <input
              type="radio"
              name="type"
              value={t}
              defaultChecked={defaultType === t}
              onChange={() => setSelectedType(t)}
              className="sr-only"
            />
            {t === "expense" ? "支出" : "収入"}
          </label>
        ))}
      </div>

      {/* 日時 */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500">日時</label>
        <input
          type="datetime-local"
          name="occurredOn"
          defaultValue={editTarget?.occurredOn ? rfc3339ToDatetimeLocal(editTarget.occurredOn) : nowLocal()}
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* 金額 */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500">金額（円）</label>
        <input
          type="number"
          name="amount"
          defaultValue={editTarget?.amount ?? ""}
          min={1}
          step={1}
          required
          placeholder="0"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* 口座 */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500">口座</label>
        {activeAccounts.length === 0 ? (
          <p className="text-xs text-amber-600">口座がありません。先に口座を追加してください。</p>
        ) : (
          <select
            name="accountId"
            defaultValue={editTarget?.accountId ?? ""}
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="" disabled>選択してください</option>
            {activeAccounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* カテゴリ */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500">カテゴリ</label>
        {filteredCategories.length === 0 ? (
          <p className="text-xs text-amber-600">カテゴリがありません。先にカテゴリを追加してください。</p>
        ) : (
          <select
            key={selectedType}
            name="categoryId"
            defaultValue={editTarget?.type === selectedType ? (editTarget?.categoryId ?? "") : ""}
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="" disabled>選択してください</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* メモ */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500">メモ（任意）</label>
        <input
          type="text"
          name="memo"
          defaultValue={editTarget?.memo ?? ""}
          placeholder="メモを入力"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {state.status === "error" && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{state.message}</p>
      )}
      {state.status === "success" && !isEdit && (
        <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">登録しました</p>
      )}

      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 hover:bg-blue-700"
        >
          {pending ? "保存中..." : isEdit ? "更新する" : "登録する"}
        </button>
      </div>
    </form>
  );
}
