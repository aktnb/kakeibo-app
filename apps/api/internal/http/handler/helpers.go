package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/aktnb/kakeibo-app/apps/api/internal/auth"
	httpresponse "github.com/aktnb/kakeibo-app/apps/api/internal/http/response"
	"github.com/aktnb/kakeibo-app/apps/api/internal/repository"
	householdusecase "github.com/aktnb/kakeibo-app/apps/api/internal/usecase/household"
)

type currentSession struct {
	UserID      string
	HouseholdID string
}

func resolveCurrentSession(r *http.Request, householdService *householdusecase.Service) (*currentSession, error) {
	principal, ok := auth.PrincipalFromContext(r.Context())
	if !ok {
		return nil, auth.ErrUnauthorized
	}

	out, err := householdService.GetCurrent(r.Context(), principal.FirebaseUID)
	if err != nil {
		return nil, err
	}

	return &currentSession{
		UserID:      out.User.ID,
		HouseholdID: out.Household.ID,
	}, nil
}

func decodeJSON(r *http.Request, dst any) error {
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	return decoder.Decode(dst)
}

func writeUsecaseError(w http.ResponseWriter, err error, fallbackMessage string) {
	switch {
	case errors.Is(err, auth.ErrUnauthorized):
		httpresponse.WriteError(w, http.StatusUnauthorized, "unauthorized", "missing auth principal")
	case errors.Is(err, repository.ErrNotFound):
		httpresponse.WriteError(w, http.StatusNotFound, "not_found", "resource not found")
	case errors.Is(err, repository.ErrConflict):
		httpresponse.WriteError(w, http.StatusConflict, "conflict", "resource conflict")
	default:
		httpresponse.WriteError(w, http.StatusInternalServerError, "internal_error", fallbackMessage)
	}
}
