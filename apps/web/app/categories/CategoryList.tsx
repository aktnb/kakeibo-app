"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { archiveCategoryAction } from "./actions";
import CategoryForm from "./CategoryForm";
import type { ActionState, Category } from "../../lib/types";

type Props = {
  categories: Category[];
};

const IDLE: ActionState<Category> = { status: "idle" };

function CategoryMenu({ category, onEdit }: { category: Category; onEdit: () => void }) {
  const [open, setOpen] = useState(false);
  const [, archiveAction, pending] = useActionState(archiveCategoryAction, IDLE);
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
          {!category.isArchived && (
            <button
              type="button"
              onClick={() => { setOpen(false); onEdit(); }}
              className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
            >
              編集
            </button>
          )}
          <form action={archiveAction}>
            <input type="hidden" name="id" value={category.id} />
            <input type="hidden" name="isArchived" value={String(category.isArchived)} />
            <button
              type="submit"
              disabled={pending}
              className={`w-full px-3 py-2 text-left text-xs disabled:opacity-60 ${
                category.isArchived
                  ? "text-green-600 hover:bg-green-50"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {pending ? "..." : category.isArchived ? "復元" : "アーカイブ"}
            </button>
          </form>
        </div>
      )}
    </div>
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
        <CategoryMenu category={category} onEdit={() => setEditId(category.id)} />
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
