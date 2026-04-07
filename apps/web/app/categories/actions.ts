"use server";

import { revalidatePath } from "next/cache";
import { createCategory, updateCategory } from "../../lib/api";
import type { ActionState, Category } from "../../lib/types";

const NAME_MAX_LENGTH = 50;
const COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

export async function createCategoryAction(
  _prev: ActionState<Category>,
  formData: FormData
): Promise<ActionState<Category>> {
  const name = formData.get("name") as string;
  const kindRaw = formData.get("kind");
  const color = formData.get("color") as string | null;
  const sortOrderRaw = formData.get("sortOrder") as string;

  if (!name || name.length > NAME_MAX_LENGTH) {
    return { status: "error", message: `カテゴリ名は${NAME_MAX_LENGTH}文字以内で入力してください` };
  }
  if (kindRaw !== "income" && kindRaw !== "expense") {
    return { status: "error", message: "種別が不正です" };
  }
  if (color && !COLOR_REGEX.test(color)) {
    return { status: "error", message: "カラーの形式が不正です" };
  }

  const sortOrder = parseInt(sortOrderRaw || "0", 10);

  try {
    const category = await createCategory({
      name,
      kind: kindRaw,
      color: color || null,
      sortOrder,
    });
    revalidatePath("/categories");
    return { status: "success", data: category };
  } catch {
    return { status: "error", message: "作成に失敗しました" };
  }
}

export async function updateCategoryAction(
  _prev: ActionState<Category>,
  formData: FormData
): Promise<ActionState<Category>> {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string | null;
  const color = formData.get("color") as string | null;

  if (!id) {
    return { status: "error", message: "IDが不正です" };
  }
  if (name && name.length > NAME_MAX_LENGTH) {
    return { status: "error", message: `カテゴリ名は${NAME_MAX_LENGTH}文字以内で入力してください` };
  }
  if (color && !COLOR_REGEX.test(color)) {
    return { status: "error", message: "カラーの形式が不正です" };
  }

  try {
    const category = await updateCategory(id, {
      name: name || undefined,
      color: color || null,
    });
    revalidatePath("/categories");
    return { status: "success", data: category };
  } catch {
    return { status: "error", message: "更新に失敗しました" };
  }
}

export async function archiveCategoryAction(
  _prev: ActionState<Category>,
  formData: FormData
): Promise<ActionState<Category>> {
  const id = formData.get("id") as string;
  const currentArchived = formData.get("isArchived") === "true";

  if (!id) {
    return { status: "error", message: "IDが不正です" };
  }

  try {
    const category = await updateCategory(id, { isArchived: !currentArchived });
    revalidatePath("/categories");
    return { status: "success", data: category };
  } catch {
    return { status: "error", message: "更新に失敗しました" };
  }
}
