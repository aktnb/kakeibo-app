"use server";

import { revalidatePath } from "next/cache";
import { createEntry, updateEntry, deleteEntry } from "../../lib/api";
import type { ActionState, Entry } from "../../lib/types";

const DATETIME_LOCAL_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const MEMO_MAX_LENGTH = 200;

function datetimeLocalToRFC3339(value: string): string {
  return `${value}:00+09:00`;
}

export async function createEntryAction(
  _prev: ActionState<Entry>,
  formData: FormData
): Promise<ActionState<Entry>> {
  const typeRaw = formData.get("type");
  if (typeRaw !== "income" && typeRaw !== "expense") {
    return { status: "error", message: "種別が不正です" };
  }
  const type = typeRaw;

  const occurredOnRaw = formData.get("occurredOn") as string;
  if (!occurredOnRaw || !DATETIME_LOCAL_REGEX.test(occurredOnRaw)) {
    return { status: "error", message: "日時の形式が不正です" };
  }
  const occurredOn = datetimeLocalToRFC3339(occurredOnRaw);

  const accountId = formData.get("accountId") as string;
  const categoryId = formData.get("categoryId") as string;
  if (!accountId || !categoryId) {
    return { status: "error", message: "口座とカテゴリを選択してください" };
  }

  const amountRaw = formData.get("amount") as string;
  const amount = parseInt(amountRaw, 10);
  if (isNaN(amount) || amount <= 0) {
    return { status: "error", message: "金額は1以上の整数を入力してください" };
  }

  const memo = formData.get("memo") as string | null;
  if (memo && memo.length > MEMO_MAX_LENGTH) {
    return { status: "error", message: `メモは${MEMO_MAX_LENGTH}文字以内で入力してください` };
  }

  try {
    const entry = await createEntry({
      type,
      occurredOn,
      accountId,
      categoryId,
      amount,
      memo: memo || null,
    });
    revalidatePath("/entries");
    revalidatePath("/");
    return { status: "success", data: entry };
  } catch {
    return { status: "error", message: "作成に失敗しました" };
  }
}

export async function updateEntryAction(
  _prev: ActionState<Entry>,
  formData: FormData
): Promise<ActionState<Entry>> {
  const id = formData.get("id") as string;
  if (!id) {
    return { status: "error", message: "IDが不正です" };
  }

  const occurredOnRaw = formData.get("occurredOn") as string | null;
  if (occurredOnRaw && !DATETIME_LOCAL_REGEX.test(occurredOnRaw)) {
    return { status: "error", message: "日時の形式が不正です" };
  }
  const occurredOnConverted = occurredOnRaw ? datetimeLocalToRFC3339(occurredOnRaw) : undefined;

  const accountId = formData.get("accountId") as string | null;
  const categoryId = formData.get("categoryId") as string | null;

  const amountRaw = formData.get("amount") as string | null;
  let amount: number | undefined;
  if (amountRaw) {
    amount = parseInt(amountRaw, 10);
    if (isNaN(amount) || amount <= 0) {
      return { status: "error", message: "金額は1以上の整数を入力してください" };
    }
  }

  const memo = formData.get("memo") as string | null;
  if (memo && memo.length > MEMO_MAX_LENGTH) {
    return { status: "error", message: `メモは${MEMO_MAX_LENGTH}文字以内で入力してください` };
  }

  try {
    const entry = await updateEntry(id, {
      occurredOn: occurredOnConverted,
      accountId: accountId || undefined,
      categoryId: categoryId || undefined,
      amount,
      memo: memo || null,
    });
    revalidatePath("/entries");
    revalidatePath("/");
    return { status: "success", data: entry };
  } catch {
    return { status: "error", message: "更新に失敗しました" };
  }
}

export async function deleteEntryAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = formData.get("id") as string;
  if (!id) {
    return { status: "error", message: "IDが不正です" };
  }

  try {
    await deleteEntry(id);
    revalidatePath("/entries");
    revalidatePath("/");
    return { status: "success", data: undefined };
  } catch {
    return { status: "error", message: "削除に失敗しました" };
  }
}
