package handler

import (
	"database/sql"
	"net/http"

	httpresponse "github.com/aktnb/kakeibo-app/apps/api/internal/http/response"
)

type HealthHandler struct {
	db *sql.DB
}

func NewHealthHandler(db *sql.DB) *HealthHandler {
	return &HealthHandler{db: db}
}

func (h *HealthHandler) Healthz(w http.ResponseWriter, r *http.Request) {
	httpresponse.WriteJSON(w, http.StatusOK, map[string]string{
		"status": "ok",
	})
}

func (h *HealthHandler) Readyz(w http.ResponseWriter, r *http.Request) {
	if err := h.db.PingContext(r.Context()); err != nil {
		httpresponse.WriteJSON(w, http.StatusServiceUnavailable, map[string]string{
			"status": "database_unavailable",
		})
		return
	}

	httpresponse.WriteJSON(w, http.StatusOK, map[string]string{
		"status": "ready",
	})
}
