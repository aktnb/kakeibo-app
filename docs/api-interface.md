# API Interface Draft

残高の森の MVP 向け API インターフェース案。

前提:

- 認証は Firebase Auth
- API では `Authorization: Bearer <Firebase ID Token>` を受け取る
- 認証後、サーバー側で `firebase_uid -> app user -> household` を解決する
- クライアントは `household_id` を直接指定しない
- ベースパスは `/api/v1`

## リソース

MVP で先に固定するリソース:

- me
- accounts
- categories
- entries
- summary

## 認証と初期化

### `POST /api/v1/auth/session`

初回アクセス時のアプリ内ユーザー初期化と、ログイン済みユーザー情報の返却。

用途:

- Firebase ID token が有効か確認する
- `users` にレコードがなければ作る
- MVP では同時に `households` も自動作成する
- フロントエンドが初回ロード時の状態を取得する

request body:

```json
{}
```

response `200`:

```json
{
  "user": {
    "id": "usr_01",
    "firebaseUid": "firebase-uid",
    "displayName": "aktnb"
  },
  "household": {
    "id": "hh_01",
    "name": "aktnb household"
  }
}
```

### `GET /api/v1/me`

現在のログインユーザーと所属 household を返す。

response `200`:

```json
{
  "user": {
    "id": "usr_01",
    "firebaseUid": "firebase-uid",
    "displayName": "aktnb"
  },
  "household": {
    "id": "hh_01",
    "name": "aktnb household"
  }
}
```

## Accounts

口座は household 配下の残高管理単位。例: 現金、住信SBI、楽天カード。

### account object

```json
{
  "id": "acc_01",
  "name": "住信SBI",
  "type": "bank",
  "currency": "JPY",
  "openingBalance": 100000,
  "currentBalance": 125000,
  "isArchived": false,
  "createdAt": "2026-04-06T10:00:00Z",
  "updatedAt": "2026-04-06T10:00:00Z"
}
```

### `GET /api/v1/accounts`

household に属する口座一覧を返す。

query:

- `includeArchived=true|false`

### `POST /api/v1/accounts`

request:

```json
{
  "name": "住信SBI",
  "type": "bank",
  "currency": "JPY",
  "openingBalance": 100000
}
```

### `PATCH /api/v1/accounts/{accountId}`

request:

```json
{
  "name": "住信SBI ネット銀行",
  "isArchived": false
}
```

## Categories

カテゴリは household 共通。収入と支出で利用範囲を持たせる。

### category object

```json
{
  "id": "cat_01",
  "name": "食費",
  "kind": "expense",
  "color": "#3D8B5C",
  "sortOrder": 10,
  "isArchived": false,
  "createdAt": "2026-04-06T10:00:00Z",
  "updatedAt": "2026-04-06T10:00:00Z"
}
```

### `GET /api/v1/categories`

query:

- `kind=income|expense`
- `includeArchived=true|false`

### `POST /api/v1/categories`

request:

```json
{
  "name": "食費",
  "kind": "expense",
  "color": "#3D8B5C",
  "sortOrder": 10
}
```

### `PATCH /api/v1/categories/{categoryId}`

request:

```json
{
  "name": "外食費",
  "color": "#2F6E48",
  "sortOrder": 20,
  "isArchived": false
}
```

## Entries

収支の明細。MVP では振替は対象外にして、`income` / `expense` のみ扱う。

### entry object

```json
{
  "id": "ent_01",
  "type": "expense",
  "occurredOn": "2026-04-06",
  "accountId": "acc_01",
  "categoryId": "cat_01",
  "amount": 1200,
  "memo": "スーパー",
  "createdAt": "2026-04-06T10:00:00Z",
  "updatedAt": "2026-04-06T10:00:00Z"
}
```

### `GET /api/v1/entries`

query:

- `from=YYYY-MM-DD`
- `to=YYYY-MM-DD`
- `accountId=...`
- `categoryId=...`
- `type=income|expense`
- `pageSize=50`
- `pageToken=0..n`

### `POST /api/v1/entries`

request:

```json
{
  "type": "expense",
  "occurredOn": "2026-04-06",
  "accountId": "acc_01",
  "categoryId": "cat_01",
  "amount": 1200,
  "memo": "スーパー"
}
```

server behavior:

- `expense` の場合は account 残高を減算
- `income` の場合は account 残高を加算
- entry 作成と account 更新は同一 transaction で実行

### `PATCH /api/v1/entries/{entryId}`

request:

```json
{
  "accountId": "acc_02",
  "occurredOn": "2026-04-07",
  "categoryId": "cat_02",
  "amount": 1500,
  "memo": "スーパーまとめ買い"
}
```

server behavior:

- 旧 entry の差分を考慮して account 残高を再計算
- entry 更新と account 更新は同一 transaction で実行

### `DELETE /api/v1/entries/{entryId}`

entry を削除し、対応する account 残高を差し戻す。

response `204`

## Summary

summary は read-only API として実装済み。対象は month 単位で、household 単位の集計を返す。

実装済みエンドポイント:

- `GET /api/v1/summary/monthly-totals?month=2026-04`
- `GET /api/v1/summary/category-breakdown?month=2026-04&type=expense`
- `GET /api/v1/summary/account-balances?month=2026-04`

`GET /api/v1/summary/monthly-totals?month=2026-04`

```json
{
  "month": "2026-04",
  "income": 320000,
  "expense": 185000,
  "net": 135000,
  "entryCount": 42
}
```

`GET /api/v1/summary/category-breakdown?month=2026-04&type=expense`

```json
{
  "month": "2026-04",
  "type": "expense",
  "total": 185000,
  "items": [
    {
      "categoryID": "cat_food",
      "categoryName": "食費",
      "amount": 42000,
      "ratio": 0.227,
      "transactionCount": 18
    },
    {
      "categoryID": "cat_rent",
      "categoryName": "家賃",
      "amount": 90000,
      "ratio": 0.486,
      "transactionCount": 1
    }
  ]
}
```

`GET /api/v1/summary/account-balances?month=2026-04`

```json
{
  "month": "2026-04",
  "totalClosingBalance": 405000,
  "items": [
    {
      "accountID": "acc_cash",
      "accountName": "現金",
      "accountType": "cash",
      "openingBalance": 20000,
      "closingBalance": 25000,
      "delta": 5000
    },
    {
      "accountID": "acc_bank",
      "accountName": "住信SBI",
      "accountType": "bank",
      "openingBalance": 245000,
      "closingBalance": 380000,
      "delta": 135000
    }
  ]
}
```

validation:

- `month` は必須で `YYYY-MM` 形式
- `type` は `income|expense`

## エラーフォーマット

共通エラー形式:

```json
{
  "error": {
    "code": "validation_error",
    "message": "amount must be greater than 0"
  }
}
```

代表的な code:

- `unauthorized`
- `forbidden`
- `not_found`
- `validation_error`
- `conflict`
- `internal_error`

## 命名ルール

- path は複数形 resource を使う
- JSON は基本 camelCase
- summary response の ID 系フィールドは現実装では `categoryID` / `accountID`
- 金額は整数で扱い、通貨最小単位を使う
- 日付は `YYYY-MM-DD`
- 日時は RFC3339

## 次に決めること

1. account の `type` 列挙値
2. category の初期データをサーバーで自動投入するか
3. summary response の ID フィールド命名を `accountID` / `categoryID` のままにするか、他 API と合わせて `accountId` / `categoryId` に寄せるか
