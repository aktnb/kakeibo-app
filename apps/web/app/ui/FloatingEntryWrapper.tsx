import { createSession, getAccounts, getCategories } from "../../lib/api";
import type { Account, Category } from "../../lib/types";
import FloatingEntryButton from "./FloatingEntryButton";

export default async function FloatingEntryWrapper() {
  let accounts: Account[] = [];
  let categories: Category[] = [];

  try {
    await createSession();
    [accounts, categories] = await Promise.all([getAccounts(), getCategories()]);
  } catch {
    // API未接続時は空データで描画（EntryFormが案内メッセージを表示する）
  }

  return <FloatingEntryButton accounts={accounts} categories={categories} />;
}
