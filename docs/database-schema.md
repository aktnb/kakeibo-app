# Database Schema Draft

残高の森 MVP 向けの PostgreSQL テーブル設計案。

前提:

- 認証は Firebase Auth
- データ所有の境界は `households`
- MVP では `users` と `households` は 1:1
- API は `accounts` `categories` `entries` `summary` を中心に構成する
- summary は集計テーブルを持たず、まずは `entries` と `accounts` から算出する

## 設計方針

- 主キーはすべて UUID
- API の ID も UUID をそのまま返す
- 金額は `BIGINT` で持ち、通貨最小単位で扱う
- 通貨は MVP では `JPY` 固定運用を想定しつつ、列は持つ
- 物理削除は基本許可するが、`accounts` と `categories` は `is_archived` で論理的に隠せるようにする

## テーブル一覧

- `households`
- `users`
- `accounts`
- `categories`
- `entries`

## households

世帯の所有境界。

| column | type | nullable | notes |
| --- | --- | --- | --- |
| `id` | `uuid` | no | PK |
| `name` | `text` | no | 世帯名 |
| `created_at` | `timestamptz` | no | default `now()` |
| `updated_at` | `timestamptz` | no | default `now()` |

制約:

- `name <> ''`

## users

Firebase Auth の `uid` に対応するアプリ内ユーザー。

| column | type | nullable | notes |
| --- | --- | --- | --- |
| `id` | `uuid` | no | PK |
| `household_id` | `uuid` | no | FK to `households.id` |
| `firebase_uid` | `text` | no | unique |
| `display_name` | `text` | no | 初回は Firebase 側表示名をコピー |
| `created_at` | `timestamptz` | no | default `now()` |
| `updated_at` | `timestamptz` | no | default `now()` |

制約:

- `firebase_uid` unique
- MVP では `household_id` unique

補足:

- 将来 household に複数ユーザーを所属させるときは `users.household_id unique` を外す

## accounts

口座。残高更新の対象。

| column | type | nullable | notes |
| --- | --- | --- | --- |
| `id` | `uuid` | no | PK |
| `household_id` | `uuid` | no | FK to `households.id` |
| `name` | `text` | no | 口座名 |
| `type` | `text` | no | `cash`, `bank`, `credit_card`, `ewallet`, `other` |
| `currency` | `text` | no | MVP は `JPY` を想定 |
| `opening_balance` | `bigint` | no | 初期残高 |
| `current_balance` | `bigint` | no | 最新残高 |
| `is_archived` | `boolean` | no | default `false` |
| `created_at` | `timestamptz` | no | default `now()` |
| `updated_at` | `timestamptz` | no | default `now()` |

制約:

- `name <> ''`
- `type in ('cash', 'bank', 'credit_card', 'ewallet', 'other')`
- `currency ~ '^[A-Z]{3}$'`

インデックス:

- `(household_id, is_archived, created_at desc)`
- `(household_id, name)`

## categories

カテゴリ。household ごとに独立。

| column | type | nullable | notes |
| --- | --- | --- | --- |
| `id` | `uuid` | no | PK |
| `household_id` | `uuid` | no | FK to `households.id` |
| `name` | `text` | no | カテゴリ名 |
| `kind` | `text` | no | `income` or `expense` |
| `color` | `text` | yes | `#RRGGBB` |
| `sort_order` | `integer` | no | default `0` |
| `is_archived` | `boolean` | no | default `false` |
| `created_at` | `timestamptz` | no | default `now()` |
| `updated_at` | `timestamptz` | no | default `now()` |

制約:

- `name <> ''`
- `kind in ('income', 'expense')`
- `color is null or color ~ '^#[0-9A-Fa-f]{6}$'`
- `sort_order >= 0`
- unique `(household_id, kind, name)`

インデックス:

- `(household_id, kind, is_archived, sort_order, created_at)`

## entries

収支明細。MVP では `income` と `expense` のみ。

| column | type | nullable | notes |
| --- | --- | --- | --- |
| `id` | `uuid` | no | PK |
| `household_id` | `uuid` | no | FK to `households.id` |
| `account_id` | `uuid` | no | FK to `accounts.id` |
| `category_id` | `uuid` | no | FK to `categories.id` |
| `type` | `text` | no | `income` or `expense` |
| `occurred_on` | `date` | no | 発生日 |
| `amount` | `bigint` | no | 正の整数のみ |
| `memo` | `text` | yes | 200 文字程度を想定 |
| `created_by_user_id` | `uuid` | no | FK to `users.id` |
| `updated_by_user_id` | `uuid` | no | FK to `users.id` |
| `created_at` | `timestamptz` | no | default `now()` |
| `updated_at` | `timestamptz` | no | default `now()` |

制約:

- `type in ('income', 'expense')`
- `amount > 0`
- `memo is null or char_length(memo) <= 500`

インデックス:

- `(household_id, occurred_on desc, created_at desc)`
- `(household_id, account_id, occurred_on desc)`
- `(household_id, category_id, occurred_on desc)`
- `(household_id, type, occurred_on desc)`

## ownership の扱い

`entries.account_id` と `entries.category_id` は別 household のデータを指せない必要がある。

アプリケーション側では以下を必ず確認する。

- `accounts.household_id = entries.household_id`
- `categories.household_id = entries.household_id`
- `users.household_id = entries.household_id`

MVP ではまずアプリケーションで担保し、必要なら複合外部キーへ進める。

## current_balance の扱い

`accounts.current_balance` は集計値ではなく保存値として持つ。

理由:

- 口座一覧で毎回集計しなくてよい
- entry 作成時にその場で残高を更新できる
- MVP の UX では即時反映が重要

更新ルール:

- entry 作成時: `income` は加算、`expense` は減算
- entry 更新時: 旧値を打ち消して新値を反映
- entry 削除時: 逆符号で差し戻し

## summary の算出元

MVP では専用テーブルを作らず、以下から算出する。

- monthly totals: `entries`
- category breakdown: `entries` join `categories`
- account balances: `accounts` と月内 entry 集計

必要になった時点で追加検討するもの:

- materialized view
- 日次残高スナップショット
- 月次集計テーブル

## 初期カテゴリ

アプリ側の要件が固まるまでは migration に入れない。

理由:

- household ごとに投入が必要
- 初期カテゴリのカスタマイズ方針がまだ未確定

必要なら `POST /auth/session` の初回セットアップで投入する。
