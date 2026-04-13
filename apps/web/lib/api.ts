import { getSession } from "./session";
import type {
  Account,
  AccountBalances,
  Category,
  CategoryBreakdown,
  CreateAccountRequest,
  CreateCategoryRequest,
  CreateEntryRequest,
  Entry,
  EntryListParams,
  MonthlyTotals,
  Session,
  UpdateAccountRequest,
  UpdateCategoryRequest,
  UpdateEntryRequest,
} from "./types";

type RequestOptions = {
  path: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  searchParams?: Record<string, string>;
  body?: unknown;
};

const API_BASE_URL = process.env.KAKEIBO_API_BASE_URL;
const DEBUG_UID = process.env.KAKEIBO_DEBUG_UID;
const DEBUG_DISPLAY_NAME = process.env.KAKEIBO_DEBUG_DISPLAY_NAME;

function isDebugAuthConfigured(): boolean {
  return process.env.NODE_ENV !== "production" && !!DEBUG_UID;
}

function getDebugFirebaseUID(): string {
  return `local:${DEBUG_UID!}`;
}

export function buildJSTMonth(): string {
  // JST = UTC+9
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const session = await getSession();
  if (!session) {
    return { "Content-Type": "application/json" };
  }

  if (session.mode === "debug") {
    if (!isDebugAuthConfigured()) {
      throw new Error("Debug auth is not configured");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Debug-Firebase-Uid": getDebugFirebaseUID(),
    };
    if (DEBUG_DISPLAY_NAME) {
      headers["X-Debug-Display-Name"] = DEBUG_DISPLAY_NAME;
    }
    return headers;
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.token}`,
  };
}

async function request<T>({ path, method = "GET", searchParams, body }: RequestOptions): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("Missing API configuration");
  }

  const url = new URL(path, API_BASE_URL);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value);
    }
  }

  const res = await fetch(url, {
    method,
    headers: await getAuthHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request failed: ${res.status} ${text}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

// --- セッション ---

export async function createSession(): Promise<Session> {
  return request<Session>({ path: "/api/v1/auth/session", method: "POST", body: {} });
}

export async function getMe(): Promise<Session> {
  return request<Session>({ path: "/api/v1/me" });
}

// --- 口座 ---

export async function getAccounts(): Promise<Account[]> {
  return request<Account[]>({ path: "/api/v1/accounts" });
}

export async function createAccount(body: CreateAccountRequest): Promise<Account> {
  return request<Account>({ path: "/api/v1/accounts", method: "POST", body });
}

export async function updateAccount(id: string, body: UpdateAccountRequest): Promise<Account> {
  return request<Account>({ path: `/api/v1/accounts/${id}`, method: "PATCH", body });
}

// --- カテゴリ ---

export async function getCategories(): Promise<Category[]> {
  return request<Category[]>({ path: "/api/v1/categories" });
}

export async function createCategory(body: CreateCategoryRequest): Promise<Category> {
  return request<Category>({ path: "/api/v1/categories", method: "POST", body });
}

export async function updateCategory(id: string, body: UpdateCategoryRequest): Promise<Category> {
  return request<Category>({ path: `/api/v1/categories/${id}`, method: "PATCH", body });
}

// --- 収支 ---

export async function getEntries(params: EntryListParams = {}): Promise<Entry[]> {
  const searchParams: Record<string, string> = {};
  if (params.from) searchParams.from = params.from;
  if (params.to) searchParams.to = params.to;
  if (params.accountId) searchParams.accountId = params.accountId;
  if (params.categoryId) searchParams.categoryId = params.categoryId;
  if (params.type) searchParams.type = params.type;
  if (params.pageSize !== undefined) searchParams.pageSize = String(params.pageSize);
  if (params.pageToken !== undefined) searchParams.pageToken = String(params.pageToken);
  return request<Entry[]>({ path: "/api/v1/entries", searchParams });
}

export async function createEntry(body: CreateEntryRequest): Promise<Entry> {
  return request<Entry>({ path: "/api/v1/entries", method: "POST", body });
}

export async function updateEntry(id: string, body: UpdateEntryRequest): Promise<Entry> {
  return request<Entry>({ path: `/api/v1/entries/${id}`, method: "PATCH", body });
}

export async function deleteEntry(id: string): Promise<void> {
  return request<void>({ path: `/api/v1/entries/${id}`, method: "DELETE" });
}

// --- サマリー ---

export async function getMonthlyTotals(month: string): Promise<MonthlyTotals> {
  return request<MonthlyTotals>({
    path: "/api/v1/summary/monthly-totals",
    searchParams: { month },
  });
}

export async function getCategoryBreakdown(month: string): Promise<CategoryBreakdown> {
  return request<CategoryBreakdown>({
    path: "/api/v1/summary/category-breakdown",
    searchParams: { month, type: "expense" },
  });
}

export async function getAccountBalances(month: string): Promise<AccountBalances> {
  return request<AccountBalances>({
    path: "/api/v1/summary/account-balances",
    searchParams: { month },
  });
}
