SHELL := /bin/bash

ENV_FILE ?= .env.local
COMPOSE := docker compose --env-file $(ENV_FILE) -f deploy/docker-compose.local.yml
MIGRATION_FILE ?= db/migrations/0001_init.sql

.PHONY: help init-env db-up db-wait db-down db-logs migrate run dev test docker-build

help:
	@echo "Available targets:"
	@echo "  make init-env      # create .env.local from example if missing"
	@echo "  make db-up         # start local PostgreSQL"
	@echo "  make db-wait       # wait until local PostgreSQL is healthy"
	@echo "  make migrate       # apply initial migration if not yet applied"
	@echo "  make run           # run API with .env.local"
	@echo "  make dev           # start DB, run migration, start API"
	@echo "  make db-down       # stop local PostgreSQL"
	@echo "  make db-logs       # tail local PostgreSQL logs"
	@echo "  make test          # run Go tests"
	@echo "  make docker-build  # build Cloud Run image locally"

init-env:
	@if [ ! -f "$(ENV_FILE)" ]; then \
		cp deploy/.env.local.example "$(ENV_FILE)"; \
		echo "created $(ENV_FILE)"; \
	else \
		echo "$(ENV_FILE) already exists"; \
	fi

db-up: init-env
	@$(COMPOSE) up -d

db-wait: db-up
	@echo "waiting for postgres to become healthy..."
	@for i in $$(seq 1 30); do \
		if $(COMPOSE) exec -T postgres pg_isready -U postgres -d zangaka_mori >/dev/null 2>&1; then \
			echo "postgres is ready"; \
			exit 0; \
		fi; \
		sleep 1; \
	done; \
	echo "postgres did not become ready in time" >&2; \
	exit 1

migrate: db-wait
	@if $(COMPOSE) exec -T postgres psql -U postgres -d zangaka_mori -tAc "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'households'" | grep -q 1; then \
		echo "migration already applied"; \
	else \
		echo "applying $(MIGRATION_FILE)"; \
		$(COMPOSE) exec -T postgres psql -v ON_ERROR_STOP=1 -U postgres -d zangaka_mori < "$(MIGRATION_FILE)"; \
	fi

run: init-env
	@set -a; source "$(ENV_FILE)"; set +a; go run ./cmd/api

dev: migrate run

db-down: init-env
	@$(COMPOSE) down

db-logs: init-env
	@$(COMPOSE) logs -f postgres

test:
	@go test ./...

docker-build:
	@docker build -f deploy/Dockerfile -t zangaka-mori-api .
