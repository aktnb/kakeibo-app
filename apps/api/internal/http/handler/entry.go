package handler

import (
	"net/http"
	"strconv"
	"time"

	domainentry "github.com/aktnb/kakeibo-app/apps/api/internal/domain/entry"
	httprequest "github.com/aktnb/kakeibo-app/apps/api/internal/http/request"
	httpresponse "github.com/aktnb/kakeibo-app/apps/api/internal/http/response"
	entryusecase "github.com/aktnb/kakeibo-app/apps/api/internal/usecase/entry"
	householdusecase "github.com/aktnb/kakeibo-app/apps/api/internal/usecase/household"
)

type EntryHandler struct {
	entryService     *entryusecase.Service
	householdService *householdusecase.Service
}

func NewEntryHandler(entryService *entryusecase.Service, householdService *householdusecase.Service) *EntryHandler {
	return &EntryHandler{entryService: entryService, householdService: householdService}
}

func (h *EntryHandler) List(w http.ResponseWriter, r *http.Request) {
	session, err := resolveCurrentSession(r, h.householdService)
	if err != nil {
		writeUsecaseError(w, err, "failed to load current session")
		return
	}
	var from, to *time.Time
	if raw := r.URL.Query().Get("from"); raw != "" {
		v, err := parseDate(raw)
		if err != nil {
			httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "invalid from date")
			return
		}
		from = &v
	}
	if raw := r.URL.Query().Get("to"); raw != "" {
		v, err := parseDate(raw)
		if err != nil {
			httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "invalid to date")
			return
		}
		to = &v
	}
	var accountID, categoryID *string
	if raw := r.URL.Query().Get("accountId"); raw != "" {
		accountID = &raw
	}
	if raw := r.URL.Query().Get("categoryId"); raw != "" {
		categoryID = &raw
	}
	var entryType *domainentry.Type
	if raw := r.URL.Query().Get("type"); raw != "" {
		t := domainentry.Type(raw)
		entryType = &t
	}
	limit := 50
	if raw := r.URL.Query().Get("pageSize"); raw != "" {
		if v, err := strconv.Atoi(raw); err == nil && v > 0 {
			limit = v
		}
	}
	offset := 0
	if raw := r.URL.Query().Get("pageToken"); raw != "" {
		if v, err := strconv.Atoi(raw); err == nil && v >= 0 {
			offset = v
		}
	}
	entries, err := h.entryService.List(r.Context(), entryusecase.ListInput{
		HouseholdID: session.HouseholdID,
		From:        from,
		To:          to,
		AccountID:   accountID,
		CategoryID:  categoryID,
		Type:        entryType,
		Limit:       limit,
		Offset:      offset,
	})
	if err != nil {
		writeUsecaseError(w, err, "failed to list entries")
		return
	}
	httpresponse.WriteJSON(w, http.StatusOK, httpresponse.NewEntries(entries))
}

func (h *EntryHandler) Create(w http.ResponseWriter, r *http.Request) {
	session, err := resolveCurrentSession(r, h.householdService)
	if err != nil {
		writeUsecaseError(w, err, "failed to load current session")
		return
	}
	var req httprequest.CreateEntryRequest
	if err := decodeJSON(r, &req); err != nil {
		httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "invalid request body")
		return
	}
	occurredOn, err := parseDateTime(req.OccurredOn)
	if err != nil {
		httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "invalid occurredOn")
		return
	}
	if err := validateEntryType(req.Type); err != nil {
		httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "invalid entry type")
		return
	}
	if req.AccountID == "" || req.CategoryID == "" {
		httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "accountId and categoryId are required")
		return
	}
	if err := validateAmount(req.Amount); err != nil {
		httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "amount must be greater than 0")
		return
	}
	e, err := h.entryService.Create(r.Context(), entryusecase.CreateInput{
		HouseholdID: session.HouseholdID,
		UserID:      session.UserID,
		AccountID:   req.AccountID,
		CategoryID:  req.CategoryID,
		Type:        domainentry.Type(req.Type),
		OccurredOn:  occurredOn,
		Amount:      req.Amount,
		Memo:        req.Memo,
	})
	if err != nil {
		writeUsecaseError(w, err, "failed to create entry")
		return
	}
	httpresponse.WriteJSON(w, http.StatusOK, httpresponse.NewEntry(*e))
}

func (h *EntryHandler) Update(w http.ResponseWriter, r *http.Request) {
	session, err := resolveCurrentSession(r, h.householdService)
	if err != nil {
		writeUsecaseError(w, err, "failed to load current session")
		return
	}
	var req httprequest.UpdateEntryRequest
	if err := decodeJSON(r, &req); err != nil {
		httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "invalid request body")
		return
	}
	var occurredOn *time.Time
	if req.OccurredOn != nil {
		v, err := parseDateTime(*req.OccurredOn)
		if err != nil {
			httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "invalid occurredOn")
			return
		}
		occurredOn = &v
	}
	var memo **string
	if req.Memo != nil {
		memo = &req.Memo
	}
	if req.Amount != nil {
		if err := validateAmount(*req.Amount); err != nil {
			httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "amount must be greater than 0")
			return
		}
	}
	e, err := h.entryService.Update(r.Context(), entryusecase.UpdateInput{
		ID:          r.PathValue("entryId"),
		HouseholdID: session.HouseholdID,
		UserID:      session.UserID,
		AccountID:   req.AccountID,
		CategoryID:  req.CategoryID,
		OccurredOn:  occurredOn,
		Amount:      req.Amount,
		Memo:        memo,
	})
	if err != nil {
		writeUsecaseError(w, err, "failed to update entry")
		return
	}
	httpresponse.WriteJSON(w, http.StatusOK, httpresponse.NewEntry(*e))
}

func (h *EntryHandler) Delete(w http.ResponseWriter, r *http.Request) {
	session, err := resolveCurrentSession(r, h.householdService)
	if err != nil {
		writeUsecaseError(w, err, "failed to load current session")
		return
	}
	if err := h.entryService.Delete(r.Context(), entryusecase.DeleteInput{
		ID:          r.PathValue("entryId"),
		HouseholdID: session.HouseholdID,
	}); err != nil {
		writeUsecaseError(w, err, "failed to delete entry")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func parseDate(value string) (time.Time, error) { return time.Parse(time.DateOnly, value) }

func parseDateTime(value string) (time.Time, error) { return time.Parse(time.RFC3339, value) }
