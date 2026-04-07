# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**残高の森** — 家計簿アプリ。モノレポ構成で `apps/web`（Next.js フロントエンド）と `apps/api`（Go バックエンド）の 2 アプリから成る。

## コマンド

### Web (`apps/web`)

```bash
pnpm dev          # 開発サーバー起動 (http://localhost:3000)
pnpm build        # ビルド
pnpm lint         # ESLint
```

環境変数セットアップ:
```bash
cp .env.example .env.local
```

`.env.local` が未設定の場合はモックデータで動作する。`KAKEIBO_API_BASE_URL` と `KAKEIBO_BEARER_TOKEN` を設定すると実 API に接続する。

### API (`apps/api`)

```bash
make dev          # DB 起動 → マイグレーション → API サーバー起動
make test         # Go テスト実行
make db-up        # PostgreSQL のみ起動
make db-down      # PostgreSQL 停止
make docker-build # Cloud Run イメージのローカルビルド
```

`ALLOW_INSECURE_AUTH=true` を設定すると Firebase ID token の代わりに `X-Debug-Firebase-Uid` / `X-Debug-Display-Name` ヘッダで認証をバイパスできる。

## アーキテクチャ

### Web (`apps/web`)

- **Next.js App Router** を使用（このバージョンは破壊的変更あり。コードを書く前に `node_modules/next/dist/docs/` のガイドを参照すること）
- `app/page.tsx` — Server Component として dashboard データを取得・表示するシングルページ
- `lib/api.ts` — API 呼び出し or モックデータへのフォールバック
- `lib/types.ts` — 型定義
- `lib/mock-data.ts` — オフライン開発用モックデータ

### API (`apps/api`)

レイヤードアーキテクチャ:

```
HTTP ハンドラ (internal/http/handler)
  → usecase (internal/usecase)
    → repository interface (internal/domain)
      → PostgreSQL 実装 (internal/repository/postgres)
```

- **所有単位は household** — `user_id` ではなく `household_id` を主キーとして扱う
- **Firebase uid とアプリ内 user は別管理**
- **HTTP の入出力型は domain model と直接共有しない**（request/response DTO を経由）
- 月次サマリは参照専用 usecase として更新系ドメインと分離
- Cloud Run 向け設定は `deploy/` に集約

### ドメイン

`account`, `category`, `entry`, `household`, `summary`, `user` の 6 ドメイン。

### データベース

PostgreSQL。マイグレーションファイルは `db/migrations/`。ローカルは Docker Compose で起動する。

## 注意事項

- Web: このリポジトリが使う Next.js は通常のバージョンと API や規約が異なる可能性がある。コードを変更する前に `node_modules/next/dist/docs/` を読むこと。
- API: `internal/` パッケージは外部に公開しない。HTTP 層から SQL へ直接依存させない。
