## Web MVP

`apps/web` は残高の森の MVP 向け Next.js フロントエンドです。

現状は API 接続前提の Web UI です。認証は以下の 2 モードで動きます。

- Firebase ログイン
- ローカル debug ログイン

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

# Firebase ログイン
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=

# ローカル debug ログイン
KAKEIBO_DEBUG_UID=local-user
KAKEIBO_DEBUG_DISPLAY_NAME=LocalUser
NEXT_PUBLIC_KAKEIBO_DEBUG_AUTH_ENABLED=true
```

ローカル debug ログインを使う場合は、API 側でも `ALLOW_INSECURE_AUTH=true` が必要です。

## 認証フロー

- Firebase 設定がある場合: `/login` から Google ログインし、`/api/auth` 経由で `__session` cookie と API session を確立します
- Firebase 未設定かつ debug 認証を有効にした場合: `/login` にローカルログインボタンが表示されます
- cookie がない状態で保護ページへアクセスすると `/login` にリダイレクトされます

## Current Scope

- 月次サマリー
- 口座残高一覧
- 支出カテゴリ内訳
- 直近明細一覧
- 明細入力仕様の確認用 UI

まだ CRUD 操作はつないでいません。まずは MVP として必要な画面の骨格と API 接続面を固定する段階です。
