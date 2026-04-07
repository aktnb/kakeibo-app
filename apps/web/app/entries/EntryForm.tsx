"use client";

import { useActionState, useEffect, useRef } from "react";
import { createEntryAction, updateEntryAction } from "./actions";
import type { Account, ActionState, Category, Entry } from "../../lib/types";

type Props = {
  accounts: Account[];
  categories: Category[];
  editTarget?: Entry | null;
  onCancel?: () => void;
};

const IDLE: ActionState<Entry> = { status: "idle" };

function todayJST(): string {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return now.toISOString().slice(0, 10);
}

export default function EntryForm({ accounts, categories, editTarget, onCancel }: Props) {
  const isEdit = !!editTarget;
  const action = isEdit ? updateEntryAction : createEntryAction;
  const [state, formAction, pending] = useActionState(action, IDLE);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success" && !isEdit) {
      formRef.current?.reset();
    }
  }, [state, isEdit]);

  const defaultType = editTarget?.type ?? "expense";
  const incomeCategories = categories.filter((c) => c.kind === "income" && !c.isArchived);
  const expenseCategories = categories.filter((c) => c.kind === "expense" && !c.isArchived);
  const activeAccounts = accounts.filter((a) => !a.isArchived);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
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
              className="sr-only"
            />
            {t === "expense" ? "支出" : "収入"}
          </label>
        ))}
      </div>

      {/* 日付 */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500">日付</label>
        <input
          type="date"
          name="occurredOn"
          defaultValue={editTarget?.occurredOn ?? todayJST()}
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
        {categories.filter((c) => !c.isArchived).length === 0 ? (
          <p className="text-xs text-amber-600">カテゴリがありません。先にカテゴリを追加してください。</p>
        ) : (
          <select
            name="categoryId"
            defaultValue={editTarget?.categoryId ?? ""}
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="" disabled>選択してください</option>
            {expenseCategories.length > 0 && (
              <optgroup label="支出">
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </optgroup>
            )}
            {incomeCategories.length > 0 && (
              <optgroup label="収入">
                {incomeCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </optgroup>
            )}
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
