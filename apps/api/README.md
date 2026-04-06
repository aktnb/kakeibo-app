# apps/api

Go で実装するバックエンド API です。

## 方針

- Cloud Run に単体デプロイする HTTP API
- PostgreSQL を永続化層として利用
- 認証は Firebase Auth の ID token を検証して扱う
- データの所有単位は household とする
- MVP では user と household は 1:1 を前提にする
- `cmd/` にエントリポイント、`internal/` にアプリケーション本体を配置
- ドメイン別の責務と、HTTP / usecase / persistence の層を分離

## ディレクトリ

```text
apps/api
├── cmd/api/                 # Cloud Run の起動エントリポイント
├── internal/config/         # 環境変数、設定読み込み
├── internal/auth/           # Firebase Auth 検証、認可コンテキスト
├── internal/domain/
│   ├── account/
│   ├── category/
│   ├── entry/
│   ├── household/
│   ├── summary/
│   └── user/
├── internal/http/
│   ├── handler/             # account, category, entry, summary などの HTTP ハンドラ
│   ├── middleware/          # 認証、ログ、CORS など
│   ├── request/             # リクエスト DTO / バリデーション
│   ├── response/            # レスポンス DTO
│   └── router/              # ルーティング定義
├── internal/repository/
│   ├── postgres/            # PostgreSQL 実装
│   └── transaction/         # Tx 境界
├── internal/usecase/
│   ├── account/
│   ├── category/
│   ├── entry/
│   ├── household/
│   └── summary/
├── internal/service/        # 外部サービス連携や横断ロジック
├── db/migrations/           # PostgreSQL マイグレーション
└── deploy/                  # Dockerfile などデプロイ関連
```

## 初期ルール

- ドメインは household を境界にして考える
- `user_id` ではなく `household_id` を主な所有キーにする
- Firebase の `uid` とアプリ内の `user` は分けて扱う
- HTTP の入出力型を domain model と直接共有しない
- SQL を採用する場合でも、web 層から SQL へ直接依存させない
- Cloud Run 向け設定は `deploy/` に寄せ、アプリ本体と混ぜない
- 月次サマリは更新系ドメインとは分離し、参照用 usecase として扱う
