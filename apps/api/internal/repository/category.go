package repository

import (
	"context"

	"github.com/aktnb/kakeibo-app/apps/api/internal/domain/category"
)

type CategoryListParams struct {
	HouseholdID     string
	Kind            *category.Kind
	IncludeArchived bool
}

type CategoryRepository interface {
	GetByID(ctx context.Context, id string) (*category.Category, error)
	ListByHouseholdID(ctx context.Context, params CategoryListParams) ([]category.Category, error)
	Create(ctx context.Context, cat *category.Category) error
	Update(ctx context.Context, cat *category.Category) error
}
