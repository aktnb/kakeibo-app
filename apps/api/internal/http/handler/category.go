package handler

import (
	"net/http"
	"strings"

	domaincategory "github.com/aktnb/kakeibo-app/apps/api/internal/domain/category"
	httprequest "github.com/aktnb/kakeibo-app/apps/api/internal/http/request"
	httpresponse "github.com/aktnb/kakeibo-app/apps/api/internal/http/response"
	categoryusecase "github.com/aktnb/kakeibo-app/apps/api/internal/usecase/category"
	householdusecase "github.com/aktnb/kakeibo-app/apps/api/internal/usecase/household"
)

type CategoryHandler struct {
	categoryService  *categoryusecase.Service
	householdService *householdusecase.Service
}

func NewCategoryHandler(categoryService *categoryusecase.Service, householdService *householdusecase.Service) *CategoryHandler {
	return &CategoryHandler{categoryService: categoryService, householdService: householdService}
}

func (h *CategoryHandler) List(w http.ResponseWriter, r *http.Request) {
	session, err := resolveCurrentSession(r, h.householdService)
	if err != nil {
		writeUsecaseError(w, err, "failed to load current session")
		return
	}
	var kind *domaincategory.Kind
	if raw := r.URL.Query().Get("kind"); raw != "" {
		k := domaincategory.Kind(raw)
		kind = &k
	}
	categories, err := h.categoryService.List(r.Context(), categoryusecase.ListInput{
		HouseholdID:     session.HouseholdID,
		Kind:            kind,
		IncludeArchived: r.URL.Query().Get("includeArchived") == "true",
	})
	if err != nil {
		writeUsecaseError(w, err, "failed to list categories")
		return
	}
	httpresponse.WriteJSON(w, http.StatusOK, httpresponse.NewCategories(categories))
}

func (h *CategoryHandler) Create(w http.ResponseWriter, r *http.Request) {
	session, err := resolveCurrentSession(r, h.householdService)
	if err != nil {
		writeUsecaseError(w, err, "failed to load current session")
		return
	}
	var req httprequest.CreateCategoryRequest
	if err := decodeJSON(r, &req); err != nil {
		httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "invalid request body")
		return
	}
	if strings.TrimSpace(req.Name) == "" {
		httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "name is required")
		return
	}
	if err := validateCategoryKind(req.Kind); err != nil {
		httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "invalid category kind")
		return
	}
	if err := validateColor(req.Color); err != nil {
		httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "invalid color")
		return
	}
	if err := validateSortOrder(req.SortOrder); err != nil {
		httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "invalid sort order")
		return
	}
	cat, err := h.categoryService.Create(r.Context(), categoryusecase.CreateInput{
		HouseholdID: session.HouseholdID,
		Name:        req.Name,
		Kind:        domaincategory.Kind(req.Kind),
		Color:       req.Color,
		SortOrder:   req.SortOrder,
	})
	if err != nil {
		writeUsecaseError(w, err, "failed to create category")
		return
	}
	httpresponse.WriteJSON(w, http.StatusOK, httpresponse.NewCategory(*cat))
}

func (h *CategoryHandler) Update(w http.ResponseWriter, r *http.Request) {
	session, err := resolveCurrentSession(r, h.householdService)
	if err != nil {
		writeUsecaseError(w, err, "failed to load current session")
		return
	}
	var req httprequest.UpdateCategoryRequest
	if err := decodeJSON(r, &req); err != nil {
		httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "invalid request body")
		return
	}
	if req.Name != nil && strings.TrimSpace(*req.Name) == "" {
		httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "name must not be empty")
		return
	}
	if err := validateColor(req.Color); err != nil {
		httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "invalid color")
		return
	}
	if req.SortOrder != nil {
		if err := validateSortOrder(*req.SortOrder); err != nil {
			httpresponse.WriteError(w, http.StatusBadRequest, "validation_error", "invalid sort order")
			return
		}
	}
	var color **string
	if req.Color != nil {
		color = &req.Color
	}
	cat, err := h.categoryService.Update(r.Context(), categoryusecase.UpdateInput{
		ID:          r.PathValue("categoryId"),
		HouseholdID: session.HouseholdID,
		Name:        req.Name,
		Color:       color,
		SortOrder:   req.SortOrder,
		IsArchived:  req.IsArchived,
	})
	if err != nil {
		writeUsecaseError(w, err, "failed to update category")
		return
	}
	httpresponse.WriteJSON(w, http.StatusOK, httpresponse.NewCategory(*cat))
}
