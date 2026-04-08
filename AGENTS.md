# Repository Guidelines

## Project Structure & Module Organization
This repository is a monorepo with two apps under `apps/`. `apps/web` is a Next.js App Router frontend; primary code lives in `app/`, shared helpers in `lib/`, and static assets in `public/`. `apps/api` is a Go HTTP API with the entrypoint in `cmd/api`, business logic in `internal/`, SQL migrations in `db/migrations/`, and deployment files in `deploy/`. Design notes and schema docs live in `docs/`.

## Build, Test, and Development Commands
Use the root `Makefile` for common workflows:

- `make dev`: starts API and web locally in parallel.
- `make api`: starts PostgreSQL, runs migrations, and launches the Go API.
- `make web`: runs the Next.js dev server in `apps/web`.
- `make test`: runs `go test ./...` in `apps/api`.
- `make down`: stops the local PostgreSQL container.

Frontend commands:

- `cd apps/web && pnpm dev`: run the web app on `http://localhost:3000`.
- `cd apps/web && pnpm build`: production build.
- `cd apps/web && pnpm lint`: run ESLint.

## Coding Style & Naming Conventions
Follow the existing style of each app. In `apps/web`, use TypeScript, ES modules, and the default Next.js ESLint rules from `eslint.config.mjs`; keep React route files in `app/` and shared helpers in `lib/`. In `apps/api`, keep packages internal unless they are true entrypoints, and preserve the HTTP -> usecase -> repository layering. Use descriptive names such as `entry_repository.go` or `validation_test.go`; avoid abbreviations unless already established in Go conventions.

## Testing Guidelines
Backend tests use Go’s standard `testing` package and live next to the code as `*_test.go`. Add or update tests for handler validation, auth middleware, and usecase behavior when touching API logic. The web app currently relies on linting and manual verification, so include clear reproduction steps in your change notes when UI behavior changes.

## Commit & Pull Request Guidelines
Recent commits are short, imperative, and focused, for example: `Add Firebase authentication with Google sign-in` and `収支種別に応じてカテゴリをフィルタリング`. Keep one logical change per commit. PRs should include a concise summary, affected areas (`apps/web`, `apps/api`, or both), test commands run, related issues, and screenshots for UI changes.

## Configuration & Security Notes
Do not commit real secrets. For API local setup, copy `apps/api/deploy/.env.local.example` to `.env.local`. `ALLOW_INSECURE_AUTH=true` is for local debugging only; use `X-Debug-Firebase-Uid` headers only in local development. In the web app, `.env.local` can omit API settings to fall back to mock data.
