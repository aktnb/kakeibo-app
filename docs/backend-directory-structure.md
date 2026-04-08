# Backend Directory Structure

`apps/api` は Cloud Run にデプロイする単一の Go API として設計する。

## 採用方針

- まずはモノリスのまま進める
- package の境界で責務を分離する
- 機能追加時は `domain -> usecase -> repository/http` の順で広げる
- Cloud Run と PostgreSQL に必要な運用ファイルはアプリ本体から分離する
- 認証は Firebase Auth の ID token を入口で検証する
- データの所属は household 単位とする
- MVP では user と household は 1:1 で開始する

## 構成

```text
apps/api
├── cmd/api/
├── internal/config/
├── internal/auth/
├── internal/domain/
│   ├── account/
│   ├── category/
│   ├── entry/
│   ├── household/
│   ├── summary/
│   └── user/
├── internal/http/
│   ├── handler/
│   ├── middleware/
│   ├── request/
│   └── response/
├── internal/router/
├── internal/repository/
│   ├── postgres/
│   └── transaction/
├── internal/service/
├── internal/usecase/
│   ├── account/
│   ├── category/
│   ├── entry/
│   ├── household/
│   └── summary/
├── db/migrations/
└── deploy/
```

## この構成にした理由

### `cmd/api`

Cloud Run の起動対象を明確にするため。`main.go` をここに固定すると、バッチや worker を追加しても入口がぶれない。

### `internal/config`

環境変数、設定読み込み、初期化を集約するため。接続文字列やポート解決が散らばらない。

### `internal/auth`

Firebase Auth の検証と、認証済みユーザーのコンテキスト生成を集約するため。HTTP middleware はここを使って `uid` と `household_id` をアプリケーション層へ渡す。

### `internal/domain`

家計簿アプリの中心概念をここに置くため。例:

- user
- household
- account
- category
- entry
- summary

MVP の主要ドメインは以下の 4 つ。

- account
- category
- entry
- summary

`household` はデータ所有境界、`user` は認証主体のアプリ内表現として持つ。

### `internal/http`

HTTP 固有の責務を domain / usecase から切り離すため。JSON の shape、バリデーション、ミドルウェアはここに閉じ込める。

ハンドラは最初からユースケース単位で分ける。

- account handler
- category handler
- entry handler
- summary handler

### `internal/router`

ルーティング定義を集約するため。認証ミドルウェアの適用範囲と、各 handler の公開エンドポイントをここでまとめて管理する。

### `internal/repository`

PostgreSQL への永続化責務を集約するため。将来 `sqlc` や `pgx` を使っても、usecase からの呼び出し面は保ちやすい。

`postgres/` に実装を寄せ、トランザクション境界は `transaction/` で吸収する。これで収支登録時に複数テーブル更新が入っても usecase 側が汚れにくい。

### `internal/usecase`

「収支を登録する」「月次サマリを取得する」のようなアプリケーションの操作単位を置くため。ハンドラから直接 repository を呼ばない。

最初に想定する usecase:

- account: 口座一覧、口座作成、口座更新
- category: カテゴリ一覧、カテゴリ作成、カテゴリ更新
- entry: 収支登録、収支一覧、収支更新、収支削除
- summary: 月次サマリ取得
- household: 初回サインイン時の household/user 初期化

### `internal/service`

認証、時刻、通知、集計補助など、複数 usecase から共有する横断処理の置き場として確保するため。

### `db/migrations`

DDL をアプリコードから分離し、デプロイやローカルセットアップ時に扱いやすくするため。

### `deploy`

`Dockerfile`、Cloud Run 用 manifest、CI/CD 補助ファイルをまとめるため。アプリケーションコードと運用設定を混ぜない。

## 今は作らないもの

- `pkg/`: 外部公開ライブラリではないため不要
- `api/openapi/`: 仕様を固めてから追加で十分
- `internal/testutil/`: テスト方針が見えてからで十分
- `db/queries/`: `sqlc` を採用する時点で追加すればよい
- `internal/domain/budget/`: MVP の主要ユースケースに入っていないため保留
- `internal/domain/balance/`: 月次サマリの仕様が固まってから必要なら追加

## 次の一手

次はこの構成を前提に API インターフェースを決める。

先に固めるべき論点は以下。

1. household 初期作成をサインイン時に自動で行うか
2. account / category / entry の識別子設計
3. 月次サマリのレスポンス粒度

API たたき台は [docs/api-interface.md](/Users/aktnb/git/kakeibo-app/docs/api-interface.md) に分離した。
