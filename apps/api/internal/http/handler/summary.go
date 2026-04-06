package handler

import (
	"net/http"

	httpresponse "github.com/aktnb/kakeibo-app/apps/api/internal/http/response"
	householdusecase "github.com/aktnb/kakeibo-app/apps/api/internal/usecase/household"
	summaryusecase "github.com/aktnb/kakeibo-app/apps/api/internal/usecase/summary"
)

type SummaryHandler struct {
	summaryService   *summaryusecase.Service
	householdService *householdusecase.Service
}

func NewSummaryHandler(summaryService *summaryusecase.Service, householdService *householdusecase.Service) *SummaryHandler {
	return &SummaryHandler{summaryService: summaryService, householdService: householdService}
}

func (h *SummaryHandler) GetMonthlyTotals(w http.ResponseWriter, r *http.Request) {
	session, err := resolveCurrentSession(r, h.householdService)
	if err != nil {
		writeUsecaseError(w, err, "failed to load current session")
		return
	}
	month := r.URL.Query().Get("month")
	if month == "" {
		httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "month is required")
		return
	}
	if err := validateMonth(month); err != nil {
		httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "invalid month")
		return
	}
	out, err := h.summaryService.GetMonthlyTotals(r.Context(), summaryusecase.MonthlyTotalsInput{
		HouseholdID: session.HouseholdID,
		Month:       month,
	})
	if err != nil {
		writeUsecaseError(w, err, "failed to load monthly totals")
		return
	}
	httpresponse.WriteJSON(w, http.StatusOK, httpresponse.NewMonthlyTotals(out))
}

func (h *SummaryHandler) GetCategoryBreakdown(w http.ResponseWriter, r *http.Request) {
	session, err := resolveCurrentSession(r, h.householdService)
	if err != nil {
		writeUsecaseError(w, err, "failed to load current session")
		return
	}
	month := r.URL.Query().Get("month")
	summaryType := r.URL.Query().Get("type")
	if month == "" || summaryType == "" {
		httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "month and type are required")
		return
	}
	if err := validateMonth(month); err != nil {
		httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "invalid month")
		return
	}
	if err := validateCategoryKind(summaryType); err != nil {
		httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "invalid type")
		return
	}
	out, err := h.summaryService.GetCategoryBreakdown(r.Context(), summaryusecase.CategoryBreakdownInput{
		HouseholdID: session.HouseholdID,
		Month:       month,
		Type:        summaryType,
	})
	if err != nil {
		writeUsecaseError(w, err, "failed to load category breakdown")
		return
	}
	httpresponse.WriteJSON(w, http.StatusOK, httpresponse.NewCategoryBreakdown(out))
}

func (h *SummaryHandler) GetAccountBalances(w http.ResponseWriter, r *http.Request) {
	session, err := resolveCurrentSession(r, h.householdService)
	if err != nil {
		writeUsecaseError(w, err, "failed to load current session")
		return
	}
	month := r.URL.Query().Get("month")
	if month == "" {
		httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "month is required")
		return
	}
	if err := validateMonth(month); err != nil {
		httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "invalid month")
		return
	}
	out, err := h.summaryService.GetAccountBalances(r.Context(), summaryusecase.AccountBalancesInput{
		HouseholdID: session.HouseholdID,
		Month:       month,
	})
	if err != nil {
		writeUsecaseError(w, err, "failed to load account balances")
		return
	}
	httpresponse.WriteJSON(w, http.StatusOK, httpresponse.NewAccountBalances(out))
}
