package handler

import (
	"errors"
	"net/http"

	"github.com/aktnb/kakeibo-app/apps/api/internal/auth"
	httpresponse "github.com/aktnb/kakeibo-app/apps/api/internal/http/response"
	"github.com/aktnb/kakeibo-app/apps/api/internal/repository"
	householdusecase "github.com/aktnb/kakeibo-app/apps/api/internal/usecase/household"
)

type AuthHandler struct {
	householdService *householdusecase.Service
}

func NewAuthHandler(householdService *householdusecase.Service) *AuthHandler {
	return &AuthHandler{householdService: householdService}
}

func (h *AuthHandler) CreateSession(w http.ResponseWriter, r *http.Request) {
	principal, ok := auth.PrincipalFromContext(r.Context())
	if !ok {
		httpresponse.WriteError(w, http.StatusUnauthorized, "unauthorized", "missing auth principal")
		return
	}

	out, err := h.householdService.EnsureUser(r.Context(), householdusecase.EnsureUserInput{
		FirebaseUID: principal.FirebaseUID,
		DisplayName: principal.DisplayName,
	})
	if err != nil {
		httpresponse.WriteError(w, http.StatusInternalServerError, "internal_error", "failed to create session")
		return
	}

	httpresponse.WriteJSON(w, http.StatusOK, httpresponse.NewSessionResponse(out.User, out.Household))
}

func (h *AuthHandler) GetMe(w http.ResponseWriter, r *http.Request) {
	principal, ok := auth.PrincipalFromContext(r.Context())
	if !ok {
		httpresponse.WriteError(w, http.StatusUnauthorized, "unauthorized", "missing auth principal")
		return
	}

	out, err := h.householdService.GetCurrent(r.Context(), principal.FirebaseUID)
	if err != nil {
		status := http.StatusInternalServerError
		code := "internal_error"
		message := "failed to load current user"
		if errors.Is(err, repository.ErrNotFound) {
			status = http.StatusNotFound
			code = "not_found"
			message = "user not found"
		}
		httpresponse.WriteError(w, status, code, message)
		return
	}

	httpresponse.WriteJSON(w, http.StatusOK, httpresponse.NewSessionResponse(out.User, out.Household))
}
