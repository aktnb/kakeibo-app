## Web MVP

`apps/web` は残高の森の MVP 向け Next.js フロントエンドです。

現状は以下の 2 モードで動きます。

- `KAKEIBO_API_BASE_URL` と `KAKEIBO_BEARER_TOKEN` がある場合は API からデータ取得
- 未設定の場合はモックデータで UI を表示

## Getting Started

1. 環境変数を作成します。

```bash
cp .env.example .env.local
```

2. 開発サーバーを起動します。

```bash
pnpm dev
```

3. `http://localhost:3000` を開きます。

## Environment Variables

```bash
KAKEIBO_API_BASE_URL=http://localhost:8080
KAKEIBO_BEARER_TOKEN=your-firebase-id-token
```

Bearer token には Firebase Auth の ID token を使います。

## Current Scope

- 月次サマリー
- 口座残高一覧
- 支出カテゴリ内訳
- 直近明細一覧
- 明細入力仕様の確認用 UI

まだ CRUD 操作はつないでいません。まずは MVP として必要な画面の骨格と API 接続面を固定する段階です。
