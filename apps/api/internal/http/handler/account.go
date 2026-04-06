package handler

import (
	"net/http"
	"strings"

	domainaccount "github.com/aktnb/kakeibo-app/apps/api/internal/domain/account"
	httprequest "github.com/aktnb/kakeibo-app/apps/api/internal/http/request"
	httpresponse "github.com/aktnb/kakeibo-app/apps/api/internal/http/response"
	accountusecase "github.com/aktnb/kakeibo-app/apps/api/internal/usecase/account"
	householdusecase "github.com/aktnb/kakeibo-app/apps/api/internal/usecase/household"
)

type AccountHandler struct {
	accountService   *accountusecase.Service
	householdService *householdusecase.Service
}

func NewAccountHandler(accountService *accountusecase.Service, householdService *householdusecase.Service) *AccountHandler {
	return &AccountHandler{accountService: accountService, householdService: householdService}
}

func (h *AccountHandler) List(w http.ResponseWriter, r *http.Request) {
	session, err := resolveCurrentSession(r, h.householdService)
	if err != nil {
		writeUsecaseError(w, err, "failed to load current session")
		return
	}
	accounts, err := h.accountService.List(r.Context(), accountusecase.ListInput{
		HouseholdID:     session.HouseholdID,
		IncludeArchived: r.URL.Query().Get("includeArchived") == "true",
	})
	if err != nil {
		writeUsecaseError(w, err, "failed to list accounts")
		return
	}
	httpresponse.WriteJSON(w, http.StatusOK, httpresponse.NewAccounts(accounts))
}

func (h *AccountHandler) Create(w http.ResponseWriter, r *http.Request) {
	session, err := resolveCurrentSession(r, h.householdService)
	if err != nil {
		writeUsecaseError(w, err, "failed to load current session")
		return
	}
	var req httprequest.CreateAccountRequest
	if err := decodeJSON(r, &req); err != nil {
		httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "invalid request body")
		return
	}
	if strings.TrimSpace(req.Name) == "" || strings.TrimSpace(req.Currency) == "" {
		httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "name and currency are required")
		return
	}
	if err := validateAccountType(req.Type); err != nil {
		httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "invalid account type")
		return
	}
	if err := validateCurrency(req.Currency); err != nil {
		httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "invalid currency")
		return
	}
	acct, err := h.accountService.Create(r.Context(), accountusecase.CreateInput{
		HouseholdID:    session.HouseholdID,
		Name:           req.Name,
		Type:           domainaccount.Type(req.Type),
		Currency:       req.Currency,
		OpeningBalance: req.OpeningBalance,
	})
	if err != nil {
		writeUsecaseError(w, err, "failed to create account")
		return
	}
	httpresponse.WriteJSON(w, http.StatusOK, httpresponse.NewAccount(*acct))
}

func (h *AccountHandler) Update(w http.ResponseWriter, r *http.Request) {
	session, err := resolveCurrentSession(r, h.householdService)
	if err != nil {
		writeUsecaseError(w, err, "failed to load current session")
		return
	}
	var req httprequest.UpdateAccountRequest
	if err := decodeJSON(r, &req); err != nil {
		httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "invalid request body")
		return
	}
	if req.Name != nil && strings.TrimSpace(*req.Name) == "" {
		httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "name must not be empty")
		return
	}
	acct, err := h.accountService.Update(r.Context(), accountusecase.UpdateInput{
		ID:          r.PathValue("accountId"),
		HouseholdID: session.HouseholdID,
		Name:        req.Name,
		IsArchived:  req.IsArchived,
	})
	if err != nil {
		writeUsecaseError(w, err, "failed to update account")
		return
	}
	httpresponse.WriteJSON(w, http.StatusOK, httpresponse.NewAccount(*acct))
}
