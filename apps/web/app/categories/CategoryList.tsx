"use client";

import { useActionState, useState } from "react";
import { archiveCategoryAction } from "./actions";
import CategoryForm from "./CategoryForm";
import type { ActionState, Category } from "../../lib/types";

type Props = {
  categories: Category[];
};

const IDLE: ActionState<Category> = { status: "idle" };

function ArchiveButton({ category }: { category: Category }) {
  const [state, formAction, pending] = useActionState(archiveCategoryAction, IDLE);
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={category.id} />
      <input type="hidden" name="isArchived" value={String(category.isArchived)} />
      <button
        type="submit"
        disabled={pending}
        className={`rounded-lg border px-2 py-1 text-xs font-medium disabled:opacity-60 ${
          category.isArchived
            ? "border-green-200 text-green-600 hover:bg-green-50"
            : "border-slate-200 text-slate-500 hover:bg-slate-50"
        }`}
      >
        {pending ? "..." : category.isArchived ? "復元" : "アーカイブ"}
      </button>
    </form>
  );
}

const kindLabel: Record<string, string> = {
  income: "収入",
  expense: "支出",
};

export default function CategoryList({ categories }: Props) {
  const [editId, setEditId] = useState<string | null>(null);
  const active = categories.filter((c) => !c.isArchived);
  const archived = categories.filter((c) => c.isArchived);

  const renderCategory = (category: Category) => {
    if (editId === category.id) {
      return (
        <div key={category.id} className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <CategoryForm editTarget={category} onCancel={() => setEditId(null)} />
        </div>
      );
    }

    return (
      <div
        key={category.id}
        className={`flex items-center justify-between rounded-xl px-4 py-3 ${
          category.isArchived ? "bg-slate-50 opacity-60" : "bg-slate-50"
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className="h-4 w-4 shrink-0 rounded-full"
            style={{ backgroundColor: category.color ?? "#6b7280" }}
          />
          <div>
            <p className="font-semibold text-slate-800">{category.name}</p>
            <p className="mt-0.5 text-xs text-slate-400">{kindLabel[category.kind] ?? category.kind}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!category.isArchived && (
            <button
              type="button"
              onClick={() => setEditId(category.id)}
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-white"
            >
              編集
            </button>
          )}
          <ArchiveButton category={category} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {active.map(renderCategory)}
      {archived.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-600">
            アーカイブ済み（{archived.length}件）
          </summary>
          <div className="mt-2 space-y-2">{archived.map(renderCategory)}</div>
        </details>
      )}
      {categories.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-400">カテゴリがありません</p>
      )}
    </div>
  );
}
