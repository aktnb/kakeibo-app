"use client";

import { useActionState, useEffect, useRef } from "react";
import { createCategoryAction, updateCategoryAction } from "./actions";
import type { ActionState, Category } from "../../lib/types";

type Props = {
  editTarget?: Category | null;
  onCancel?: () => void;
};

const IDLE: ActionState<Category> = { status: "idle" };

const COLOR_PRESETS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899",
  "#6b7280",
];

export default function CategoryForm({ editTarget, onCancel }: Props) {
  const isEdit = !!editTarget;
  const action = isEdit ? updateCategoryAction : createCategoryAction;
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

      {/* 名前 */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500">カテゴリ名</label>
        <input
          type="text"
          name="name"
          defaultValue={editTarget?.name ?? ""}
          required
          placeholder="例: 食費"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* 種別（新規のみ） */}
      {!isEdit && (
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">種別</label>
          <div className="flex gap-2">
            {(["expense", "income"] as const).map((k) => (
              <label
                key={k}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 has-[:checked]:text-blue-700"
              >
                <input
                  type="radio"
                  name="kind"
                  value={k}
                  defaultChecked={k === "expense"}
                  className="sr-only"
                />
                {k === "expense" ? "支出" : "収入"}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 色 */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500">カラー</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((color) => (
            <label key={color} className="cursor-pointer">
              <input
                type="radio"
                name="color"
                value={color}
                defaultChecked={(editTarget?.color ?? COLOR_PRESETS[0]) === color}
                className="sr-only"
              />
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full ring-2 ring-transparent ring-offset-1 has-[:checked]:ring-blue-500"
                style={{ backgroundColor: color }}
              />
            </label>
          ))}
        </div>
      </div>

      {!isEdit && <input type="hidden" name="sortOrder" value="0" />}

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
