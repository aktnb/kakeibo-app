CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE households (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT households_name_non_empty CHECK (name <> '')
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    firebase_uid TEXT NOT NULL,
    display_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT users_firebase_uid_unique UNIQUE (firebase_uid),
    CONSTRAINT users_household_id_unique UNIQUE (household_id),
    CONSTRAINT users_display_name_non_empty CHECK (display_name <> '')
);

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    currency TEXT NOT NULL,
    opening_balance BIGINT NOT NULL,
    current_balance BIGINT NOT NULL,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT accounts_name_non_empty CHECK (name <> ''),
    CONSTRAINT accounts_type_valid CHECK (type IN ('cash', 'bank', 'credit_card', 'ewallet', 'other')),
    CONSTRAINT accounts_currency_valid CHECK (currency ~ '^[A-Z]{3}$')
);

CREATE INDEX idx_accounts_household_archived_created_at
    ON accounts (household_id, is_archived, created_at DESC);

CREATE INDEX idx_accounts_household_name
    ON accounts (household_id, name);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    kind TEXT NOT NULL,
    color TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT categories_name_non_empty CHECK (name <> ''),
    CONSTRAINT categories_kind_valid CHECK (kind IN ('income', 'expense')),
    CONSTRAINT categories_color_valid CHECK (color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT categories_sort_order_valid CHECK (sort_order >= 0),
    CONSTRAINT categories_household_kind_name_unique UNIQUE (household_id, kind, name)
);

CREATE INDEX idx_categories_household_kind_archived_sort
    ON categories (household_id, kind, is_archived, sort_order, created_at);

CREATE TABLE entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    type TEXT NOT NULL,
    occurred_on DATE NOT NULL,
    amount BIGINT NOT NULL,
    memo TEXT,
    created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    updated_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT entries_type_valid CHECK (type IN ('income', 'expense')),
    CONSTRAINT entries_amount_positive CHECK (amount > 0),
    CONSTRAINT entries_memo_length CHECK (memo IS NULL OR char_length(memo) <= 500)
);

CREATE INDEX idx_entries_household_occurred_on_created_at
    ON entries (household_id, occurred_on DESC, created_at DESC);

CREATE INDEX idx_entries_household_account_occurred_on
    ON entries (household_id, account_id, occurred_on DESC);

CREATE INDEX idx_entries_household_category_occurred_on
    ON entries (household_id, category_id, occurred_on DESC);

CREATE INDEX idx_entries_household_type_occurred_on
    ON entries (household_id, type, occurred_on DESC);
