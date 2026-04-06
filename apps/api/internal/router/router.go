package router

import (
	"net/http"

	healthhandler "github.com/aktnb/kakeibo-app/apps/api/internal/http/handler"
	"github.com/aktnb/kakeibo-app/apps/api/internal/http/middleware"
)

type Dependencies struct {
	HealthHandler   *healthhandler.HealthHandler
	AuthHandler     *healthhandler.AuthHandler
	AccountHandler  *healthhandler.AccountHandler
	CategoryHandler *healthhandler.CategoryHandler
	EntryHandler    *healthhandler.EntryHandler
	SummaryHandler  *healthhandler.SummaryHandler
	AuthMiddleware  *middleware.AuthMiddleware
}

func New(deps Dependencies) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /healthz", deps.HealthHandler.Healthz)
	mux.HandleFunc("GET /readyz", deps.HealthHandler.Readyz)
	mux.Handle("POST /api/v1/auth/session", deps.AuthMiddleware.Require(http.HandlerFunc(deps.AuthHandler.CreateSession)))
	mux.Handle("GET /api/v1/me", deps.AuthMiddleware.Require(http.HandlerFunc(deps.AuthHandler.GetMe)))
	mux.Handle("GET /api/v1/accounts", deps.AuthMiddleware.Require(http.HandlerFunc(deps.AccountHandler.List)))
	mux.Handle("POST /api/v1/accounts", deps.AuthMiddleware.Require(http.HandlerFunc(deps.AccountHandler.Create)))
	mux.Handle("PATCH /api/v1/accounts/{accountId}", deps.AuthMiddleware.Require(http.HandlerFunc(deps.AccountHandler.Update)))
	mux.Handle("GET /api/v1/categories", deps.AuthMiddleware.Require(http.HandlerFunc(deps.CategoryHandler.List)))
	mux.Handle("POST /api/v1/categories", deps.AuthMiddleware.Require(http.HandlerFunc(deps.CategoryHandler.Create)))
	mux.Handle("PATCH /api/v1/categories/{categoryId}", deps.AuthMiddleware.Require(http.HandlerFunc(deps.CategoryHandler.Update)))
	mux.Handle("GET /api/v1/entries", deps.AuthMiddleware.Require(http.HandlerFunc(deps.EntryHandler.List)))
	mux.Handle("POST /api/v1/entries", deps.AuthMiddleware.Require(http.HandlerFunc(deps.EntryHandler.Create)))
	mux.Handle("PATCH /api/v1/entries/{entryId}", deps.AuthMiddleware.Require(http.HandlerFunc(deps.EntryHandler.Update)))
	mux.Handle("DELETE /api/v1/entries/{entryId}", deps.AuthMiddleware.Require(http.HandlerFunc(deps.EntryHandler.Delete)))
	mux.Handle("GET /api/v1/summary/monthly-totals", deps.AuthMiddleware.Require(http.HandlerFunc(deps.SummaryHandler.GetMonthlyTotals)))
	mux.Handle("GET /api/v1/summary/category-breakdown", deps.AuthMiddleware.Require(http.HandlerFunc(deps.SummaryHandler.GetCategoryBreakdown)))
	mux.Handle("GET /api/v1/summary/account-balances", deps.AuthMiddleware.Require(http.HandlerFunc(deps.SummaryHandler.GetAccountBalances)))

	return mux
}
