package repository

import (
	"context"
	"time"

	"github.com/aktnb/kakeibo-app/apps/api/internal/domain/entry"
)

type EntryListParams struct {
	HouseholdID string
	From        *time.Time
	To          *time.Time
	AccountID   *string
	CategoryID  *string
	Type        *entry.Type
	Limit       int
	Offset      int
}

type EntryRepository interface {
	GetByID(ctx context.Context, id string) (*entry.Entry, error)
	ListByHouseholdID(ctx context.Context, params EntryListParams) ([]entry.Entry, error)
	Create(ctx context.Context, e *entry.Entry) error
	Update(ctx context.Context, e *entry.Entry) error
	Delete(ctx context.Context, id string) error
}
