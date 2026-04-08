SHELL := /bin/bash

.PHONY: help dev api web down test

help:
	@echo "Available targets:"
	@echo "  make dev   # start API (DB + migration + server) and web dev server in parallel"
	@echo "  make api   # start API only"
	@echo "  make web   # start web dev server only"
	@echo "  make down  # stop DB"
	@echo "  make test  # run Go tests"

dev:
	@$(MAKE) -j2 api web

api:
	@$(MAKE) -C apps/api dev

web:
	@cd apps/web && pnpm dev

down:
	@$(MAKE) -C apps/api db-down

test:
	@$(MAKE) -C apps/api test
