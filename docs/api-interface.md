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

保留しながら検討するリソース:

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
- `pageToken=...`

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

summary API はまだ確定させない。

理由:

- 月次サマリに何を含めるかで DB 設計が変わる
- account の `currentBalance` を真実の値にするか、entry 集計結果に寄せるかを決める必要がある
- フロントエンドが必要とする UI 単位を見て shape を切った方がよい

先に固定してよい論点:

- summary は read-only API にする
- 対象は month 単位にする
- household 単位の集計にする

候補 A:

- `GET /api/v1/summary/monthly?month=2026-04`
- 1 API で totals, category breakdown, account balances をまとめて返す

response:

```json
{
  "month": "2026-04",
  "totals": {
    "income": 320000,
    "expense": 185000,
    "net": 135000
  },
  "categoryBreakdown": {
    "expense": [
      {
        "categoryId": "cat_food",
        "categoryName": "食費",
        "amount": 42000,
        "ratio": 0.227
      },
      {
        "categoryId": "cat_rent",
        "categoryName": "家賃",
        "amount": 90000,
        "ratio": 0.486
      }
    ],
    "income": [
      {
        "categoryId": "cat_salary",
        "categoryName": "給与",
        "amount": 300000,
        "ratio": 0.938
      }
    ]
  },
  "accountBalances": [
    {
      "accountId": "acc_cash",
      "accountName": "現金",
      "accountType": "cash",
      "balance": 25000
    },
    {
      "accountId": "acc_bank",
      "accountName": "住信SBI",
      "accountType": "bank",
      "balance": 380000
    }
  ]
}
```

候補 B:

- `GET /api/v1/summary/monthly-totals?month=2026-04`
- `GET /api/v1/summary/category-breakdown?month=2026-04&type=expense`
- `GET /api/v1/summary/account-balances?month=2026-04`

`GET /api/v1/summary/monthly-totals?month=2026-04`

```json
{
  "month": "2026-04",
  "income": 320000,
  "expense": 185000,
  "net": 135000
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
      "categoryId": "cat_food",
      "categoryName": "食費",
      "amount": 42000,
      "ratio": 0.227,
      "transactionCount": 18
    },
    {
      "categoryId": "cat_rent",
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
  "items": [
    {
      "accountId": "acc_cash",
      "accountName": "現金",
      "accountType": "cash",
      "openingBalance": 20000,
      "closingBalance": 25000,
      "delta": 5000
    },
    {
      "accountId": "acc_bank",
      "accountName": "住信SBI",
      "accountType": "bank",
      "openingBalance": 245000,
      "closingBalance": 380000,
      "delta": 135000
    }
  ]
}
```

候補 C:

- `GET /api/v1/summary/monthly-dashboard?month=2026-04`
- ダッシュボード画面専用の shape に寄せる

response:

```json
{
  "month": "2026-04",
  "headline": {
    "income": 320000,
    "expense": 185000,
    "net": 135000
  },
  "topExpenseCategories": [
    {
      "categoryId": "cat_rent",
      "categoryName": "家賃",
      "amount": 90000
    },
    {
      "categoryId": "cat_food",
      "categoryName": "食費",
      "amount": 42000
    }
  ],
  "accounts": [
    {
      "accountId": "acc_bank",
      "accountName": "住信SBI",
      "closingBalance": 380000
    }
  ]
}
```

現時点の推奨:

- 最初は候補 B
- 理由はレスポンス責務が明確で、画面ごとの必要データに合わせやすいため

## Summary の推奨 shape

MVP では候補 B で始めるのが一番堅い。

理由:

- totals, category, account で集計軸が違う
- SQL を分けやすい
- フロント側で不要なデータを抱えなくて済む
- 将来 dashboard 専用 API を追加しても既存 API を壊しにくい

### 推奨 1: monthly totals

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

この API の用途:

- ダッシュボード上部の KPI
- 前月比較を後で追加しやすい

将来追加しやすい項目:

- `previousMonthIncome`
- `previousMonthExpense`
- `previousMonthNet`

### 推奨 2: category breakdown

`GET /api/v1/summary/category-breakdown?month=2026-04&type=expense`

```json
{
  "month": "2026-04",
  "type": "expense",
  "total": 185000,
  "items": [
    {
      "categoryId": "cat_rent",
      "categoryName": "家賃",
      "amount": 90000,
      "ratio": 0.486,
      "transactionCount": 1
    },
    {
      "categoryId": "cat_food",
      "categoryName": "食費",
      "amount": 42000,
      "ratio": 0.227,
      "transactionCount": 18
    }
  ]
}
```

この API の用途:

- 円グラフ
- カテゴリ別ランキング

設計上の注意:

- `ratio` は API 側で返すとフロント実装が軽い
- `transactionCount` は UX 上かなり有用

### 推奨 3: account balances

`GET /api/v1/summary/account-balances?month=2026-04`

```json
{
  "month": "2026-04",
  "totalClosingBalance": 405000,
  "items": [
    {
      "accountId": "acc_cash",
      "accountName": "現金",
      "accountType": "cash",
      "openingBalance": 20000,
      "closingBalance": 25000,
      "delta": 5000
    },
    {
      "accountId": "acc_bank",
      "accountName": "住信SBI",
      "accountType": "bank",
      "openingBalance": 245000,
      "closingBalance": 380000,
      "delta": 135000
    }
  ]
}
```

この API の用途:

- 月末時点の口座別残高一覧
- 資産のざっくり把握

設計上の注意:

- `closingBalance` を月末時点の値として返す
- `currentBalance` とは意味が違うので summary 側では使わない

## Summary で最初は入れないもの

- 日次推移
- 予算比較
- 前月比較
- キャッシュフロー予測
- 振替込みの純資産推移

これらは UI と計算ルールが固まってから別 API にした方がよい。

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
- JSON は camelCase
- 金額は整数で扱い、通貨最小単位を使う
- 日付は `YYYY-MM-DD`
- 日時は RFC3339

## 次に決めること

1. account の `type` 列挙値
2. category の初期データをサーバーで自動投入するか
3. summary を候補 A と候補 B のどちらで始めるか
