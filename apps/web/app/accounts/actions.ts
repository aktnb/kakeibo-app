"use server";

import { revalidatePath } from "next/cache";
import { createAccount, updateAccount } from "../../lib/api";
import type { Account, ActionState } from "../../lib/types";

const NAME_MAX_LENGTH = 100;

export async function createAccountAction(
  _prev: ActionState<Account>,
  formData: FormData
): Promise<ActionState<Account>> {
  const name = formData.get("name") as string;
  const typeRaw = formData.get("type");
  const openingBalanceRaw = formData.get("openingBalance") as string;

  if (!name || name.length > NAME_MAX_LENGTH) {
    return { status: "error", message: `口座名は${NAME_MAX_LENGTH}文字以内で入力してください` };
  }
  if (typeRaw !== "bank" && typeRaw !== "cash" && typeRaw !== "credit" && typeRaw !== "ewallet") {
    return { status: "error", message: "種別が不正です" };
  }

  const openingBalance = parseInt(openingBalanceRaw || "0", 10);
  if (isNaN(openingBalance)) {
    return { status: "error", message: "初期残高は整数を入力してください" };
  }

  try {
    const account = await createAccount({ name, type: typeRaw, currency: "JPY", openingBalance });
    revalidatePath("/accounts");
    return { status: "success", data: account };
  } catch {
    return { status: "error", message: "作成に失敗しました" };
  }
}

export async function updateAccountAction(
  _prev: ActionState<Account>,
  formData: FormData
): Promise<ActionState<Account>> {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string | null;
  const isArchived = formData.get("isArchived") === "true";

  if (!id) {
    return { status: "error", message: "IDが不正です" };
  }
  if (name && name.length > NAME_MAX_LENGTH) {
    return { status: "error", message: `口座名は${NAME_MAX_LENGTH}文字以内で入力してください` };
  }

  try {
    const account = await updateAccount(id, {
      name: name || undefined,
      isArchived,
    });
    revalidatePath("/accounts");
    return { status: "success", data: account };
  } catch {
    return { status: "error", message: "更新に失敗しました" };
  }
}

export async function archiveAccountAction(
  _prev: ActionState<Account>,
  formData: FormData
): Promise<ActionState<Account>> {
  const id = formData.get("id") as string;
  const currentArchived = formData.get("isArchived") === "true";

  if (!id) {
    return { status: "error", message: "IDが不正です" };
  }

  try {
    const account = await updateAccount(id, { isArchived: !currentArchived });
    revalidatePath("/accounts");
    return { status: "success", data: account };
  } catch {
    return { status: "error", message: "更新に失敗しました" };
  }
}
