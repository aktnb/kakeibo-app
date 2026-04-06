package repository

import (
	"context"

	"github.com/aktnb/kakeibo-app/apps/api/internal/domain/household"
)

type HouseholdRepository interface {
	GetByID(ctx context.Context, id string) (*household.Household, error)
	Create(ctx context.Context, h *household.Household) error
}
