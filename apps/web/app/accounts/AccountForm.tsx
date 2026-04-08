"use client";

import { useActionState, useEffect, useRef } from "react";
import { createAccountAction, updateAccountAction } from "./actions";
import type { Account, ActionState } from "../../lib/types";

type Props = {
  editTarget?: Account | null;
  onCancel?: () => void;
};

const IDLE: ActionState<Account> = { status: "idle" };

const accountTypeOptions = [
  { value: "bank", label: "銀行口座" },
  { value: "cash", label: "現金" },
  { value: "credit", label: "クレジット" },
  { value: "ewallet", label: "電子マネー" },
] as const;

export default function AccountForm({ editTarget, onCancel }: Props) {
  const isEdit = !!editTarget;
  const action = isEdit ? updateAccountAction : createAccountAction;
  const [state, formAction, pending] = useActionState(action, IDLE);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success" && !isEdit) {
      formRef.current?.reset();
    }
    if (state.status === "success" && isEdit && onCancel) {
      onCancel();
    }
  }, [state, isEdit, onCancel]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {isEdit && <input type="hidden" name="id" value={editTarget.id} />}
      {isEdit && (
        <input type="hidden" name="isArchived" value={String(editTarget.isArchived)} />
      )}

      {/* 口座名 */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500">口座名</label>
        <input
          type="text"
          name="name"
          defaultValue={editTarget?.name ?? ""}
          required
          placeholder="例: 三菱UFJ普通口座"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* 種別（新規のみ） */}
      {!isEdit && (
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">種別</label>
          <div className="flex gap-2">
            {accountTypeOptions.map((opt) => (
              <label
                key={opt.value}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 has-[:checked]:text-blue-700"
              >
                <input
                  type="radio"
                  name="type"
                  value={opt.value}
                  defaultChecked={opt.value === "bank"}
                  className="sr-only"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 初期残高（新規のみ） */}
      {!isEdit && (
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">初期残高（円）</label>
          <input
            type="number"
            name="openingBalance"
            defaultValue={0}
            min={0}
            step={1}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
      )}

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
