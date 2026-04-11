import type {
  Account,
  AccountBalances,
  Category,
  CategoryBreakdown,
  DashboardData,
  Entry,
  MonthlyTotals,
  Session,
} from "./types";

const session: Session = {
  user: {
    id: "usr_demo",
    firebaseUid: "demo-user",
    displayName: "aktnb",
  },
  household: {
    id: "hh_demo",
    name: "aktnb household",
  },
};

const accounts: Account[] = [
  {
    id: "acc_cash",
    name: "現金",
    type: "cash",
    currency: "JPY",
    openingBalance: 30000,
    currentBalance: 18400,
    isArchived: false,
    createdAt: "2026-04-01T09:00:00Z",
    updatedAt: "2026-04-07T09:00:00Z",
  },
  {
    id: "acc_bank",
    name: "住信SBI",
    type: "bank",
    currency: "JPY",
    openingBalance: 240000,
    currentBalance: 286000,
    isArchived: false,
    createdAt: "2026-04-01T09:00:00Z",
    updatedAt: "2026-04-07T09:00:00Z",
  },
  {
    id: "acc_card",
    name: "楽天カード",
    type: "credit",
    currency: "JPY",
    openingBalance: 0,
    currentBalance: -26800,
    isArchived: false,
    createdAt: "2026-04-01T09:00:00Z",
    updatedAt: "2026-04-07T09:00:00Z",
  },
];

const categories: Category[] = [
  {
    id: "cat_food",
    name: "食費",
    kind: "expense",
    color: "#2f6a4b",
    sortOrder: 10,
    isArchived: false,
    createdAt: "2026-04-01T09:00:00Z",
    updatedAt: "2026-04-01T09:00:00Z",
  },
  {
    id: "cat_home",
    name: "日用品",
    kind: "expense",
    color: "#6f7b48",
    sortOrder: 20,
    isArchived: false,
    createdAt: "2026-04-01T09:00:00Z",
    updatedAt: "2026-04-01T09:00:00Z",
  },
  {
    id: "cat_salary",
    name: "給与",
    kind: "income",
    color: "#205f73",
    sortOrder: 10,
    isArchived: false,
    createdAt: "2026-04-01T09:00:00Z",
    updatedAt: "2026-04-01T09:00:00Z",
  },
  {
    id: "cat_freelance",
    name: "副業",
    kind: "income",
    color: "#b15e2b",
    sortOrder: 20,
    isArchived: false,
    createdAt: "2026-04-01T09:00:00Z",
    updatedAt: "2026-04-01T09:00:00Z",
  },
];

const entries: Entry[] = [
  {
    id: "ent_01",
    type: "income",
    occurredOn: "2026-04-01T09:00:00+09:00",
    accountId: "acc_bank",
    categoryId: "cat_salary",
    amount: 320000,
    memo: "4月給与",
    createdAt: "2026-04-01T09:30:00Z",
    updatedAt: "2026-04-01T09:30:00Z",
  },
  {
    id: "ent_02",
    type: "expense",
    occurredOn: "2026-04-03T12:15:00+09:00",
    accountId: "acc_cash",
    categoryId: "cat_food",
    amount: 2800,
    memo: "スーパー",
    createdAt: "2026-04-03T10:30:00Z",
    updatedAt: "2026-04-03T10:30:00Z",
  },
  {
    id: "ent_03",
    type: "expense",
    occurredOn: "2026-04-05T14:30:00+09:00",
    accountId: "acc_card",
    categoryId: "cat_home",
    amount: 6400,
    memo: "ドラッグストア",
    createdAt: "2026-04-05T10:30:00Z",
    updatedAt: "2026-04-05T10:30:00Z",
  },
  {
    id: "ent_04",
    type: "expense",
    occurredOn: "2026-04-06T12:30:00+09:00",
    accountId: "acc_cash",
    categoryId: "cat_food",
    amount: 1900,
    memo: "ランチ",
    createdAt: "2026-04-06T03:30:00Z",
    updatedAt: "2026-04-06T03:30:00Z",
  },
  {
    id: "ent_05",
    type: "income",
    occurredOn: "2026-04-07T11:00:00+09:00",
    accountId: "acc_bank",
    categoryId: "cat_freelance",
    amount: 18000,
    memo: "記事執筆",
    createdAt: "2026-04-07T02:00:00Z",
    updatedAt: "2026-04-07T02:00:00Z",
  },
];

const monthlyTotals: MonthlyTotals = {
  month: "2026-04",
  income: 338000,
  expense: 11100,
  net: 326900,
  entryCount: 5,
};

const categoryBreakdown: CategoryBreakdown = {
  month: "2026-04",
  type: "expense",
  total: 11100,
  items: [
    {
      categoryID: "cat_food",
      categoryName: "食費",
      amount: 4700,
      ratio: 0.423,
      transactionCount: 2,
    },
    {
      categoryID: "cat_home",
      categoryName: "日用品",
      amount: 6400,
      ratio: 0.577,
      transactionCount: 1,
    },
  ],
};

const accountBalances: AccountBalances = {
  month: "2026-04",
  totalClosingBalance: 277600,
  items: [
    {
      accountID: "acc_cash",
      accountName: "現金",
      accountType: "cash",
      openingBalance: 30000,
      closingBalance: 18400,
      delta: -11600,
    },
    {
      accountID: "acc_bank",
      accountName: "住信SBI",
      accountType: "bank",
      openingBalance: 240000,
      closingBalance: 286000,
      delta: 46000,
    },
    {
      accountID: "acc_card",
      accountName: "楽天カード",
      accountType: "credit",
      openingBalance: 0,
      closingBalance: -26800,
      delta: -26800,
    },
  ],
};

export function getMockDashboardData(): DashboardData {
  return {
    month: "2026-04",
    source: "mock",
    session,
    accounts,
    categories,
    entries,
    monthlyTotals,
    categoryBreakdown,
    accountBalances,
  };
}
