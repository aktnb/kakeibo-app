# Deploy

`apps/api` は Cloud Run へコンテナとしてデプロイする。

## 必須環境変数

- `DATABASE_URL`
- `PORT`

## 認証関連

本番:

- `ALLOW_INSECURE_AUTH=false`
- `FIREBASE_PROJECT_ID` は必要なら指定
- Cloud Run のサービスアカウントに Firebase Admin SDK が使える権限を付与する

ローカル開発:

- `ALLOW_INSECURE_AUTH=true`
- `X-Debug-Firebase-Uid` ヘッダで疑似認証

## Docker Build

リポジトリルートから:

```bash
docker build -f apps/api/deploy/Dockerfile -t zangaka-mori-api ./apps/api
```

## Local Setup

一番簡単なのは `apps/api` で以下を実行すること:

```bash
make dev
```

これで以下をまとめて行う。

- `.env.local` の作成
- PostgreSQL の起動
- PostgreSQL の healthcheck 待ち
- 初回 migration の適用
- API の起動

個別実行したい場合:

PostgreSQL をローカルで立ち上げる:

```bash
docker compose -f apps/api/deploy/docker-compose.local.yml up -d
```

`5432` が埋まっている場合は、先に `HOST_POSTGRES_PORT` を変える。

```bash
HOST_POSTGRES_PORT=5433 docker compose -f apps/api/deploy/docker-compose.local.yml up -d
```

API 用の環境変数ファイルを作る:

```bash
cp apps/api/deploy/.env.local.example apps/api/.env.local
```

その場合は `.env.local` の `DATABASE_URL` も同じポートに合わせる。

`Makefile` を使うなら:

```bash
cd apps/api
make init-env
make db-up
make migrate
make run
```

migration を流す:

```bash
psql postgresql://postgres:postgres@127.0.0.1:5432/zangaka_mori -f apps/api/db/migrations/0001_init.sql
```

API をローカル起動する:

```bash
cd apps/api
set -a
source .env.local
set +a
go run ./cmd/api
```

ローカルでは `ALLOW_INSECURE_AUTH=true` を使い、以下ヘッダで疑似認証する。

- `X-Debug-Firebase-Uid`
- `X-Debug-Display-Name`

例:

```bash
curl -X POST http://localhost:8080/api/v1/auth/session \
  -H "X-Debug-Firebase-Uid: local-user" \
  -H "X-Debug-Display-Name: Local User"
```

## Docker Run

```bash
docker run --rm -p 8080:8080 --env-file apps/api/deploy/env.example zangaka-mori-api
```

## Cloud Run Deploy

例:

```bash
gcloud run deploy zangaka-mori-api \
  --source ./apps/api \
  --region asia-northeast1 \
  --allow-unauthenticated=false \
  --set-env-vars FIREBASE_PROJECT_ID=your-firebase-project-id \
  --set-secrets DATABASE_URL=DATABASE_URL:latest
```

`DATABASE_URL` は Secret Manager 経由で渡す前提にする。
