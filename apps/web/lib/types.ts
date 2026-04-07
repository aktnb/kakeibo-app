export type Session = {
  user: {
    id: string;
    firebaseUid: string;
    displayName: string;
  };
  household: {
    id: string;
    name: string;
  };
};

export type Account = {
  id: string;
  name: string;
  type: string;
  currency: string;
  openingBalance: number;
  currentBalance: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  kind: "income" | "expense";
  color?: string | null;
  sortOrder: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Entry = {
  id: string;
  type: "income" | "expense";
  occurredOn: string;
  accountId: string;
  categoryId: string;
  amount: number;
  memo?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MonthlyTotals = {
  month: string;
  income: number;
  expense: number;
  net: number;
  entryCount: number;
};

export type CategoryBreakdown = {
  month: string;
  type: "income" | "expense";
  total: number;
  items: Array<{
    categoryID: string;
    categoryName: string;
    amount: number;
    ratio: number;
    transactionCount: number;
  }>;
};

export type AccountBalances = {
  month: string;
  totalClosingBalance: number;
  items: Array<{
    accountID: string;
    accountName: string;
    accountType: string;
    openingBalance: number;
    closingBalance: number;
    delta: number;
  }>;
};

export type DashboardData = {
  month: string;
  source: "api" | "mock";
  session: Session;
  accounts: Account[];
  categories: Category[];
  entries: Entry[];
  monthlyTotals: MonthlyTotals;
  categoryBreakdown: CategoryBreakdown;
  accountBalances: AccountBalances;
};

// --- リクエスト型 ---

export type CreateEntryRequest = {
  type: "income" | "expense";
  occurredOn: string;
  accountId: string;
  categoryId: string;
  amount: number;
  memo?: string | null;
};

export type UpdateEntryRequest = {
  accountId?: string;
  categoryId?: string;
  occurredOn?: string;
  amount?: number;
  memo?: string | null;
};

export type CreateAccountRequest = {
  name: string;
  type: "bank" | "cash" | "credit";
  currency: string;
  openingBalance: number;
};

export type UpdateAccountRequest = {
  name?: string;
  isArchived?: boolean;
};

export type CreateCategoryRequest = {
  name: string;
  kind: "income" | "expense";
  color?: string | null;
  sortOrder: number;
};

export type UpdateCategoryRequest = {
  name?: string;
  color?: string | null;
  sortOrder?: number;
  isArchived?: boolean;
};

export type EntryListParams = {
  from?: string;
  to?: string;
  accountId?: string;
  categoryId?: string;
  type?: "income" | "expense";
  pageSize?: number;
  pageToken?: number;
};

// --- Server Action 状態型 ---

export type ActionState<T = void> =
  | { status: "idle" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };
