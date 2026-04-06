package repository

import (
	"context"

	"github.com/aktnb/kakeibo-app/apps/api/internal/domain/account"
)

type AccountListParams struct {
	HouseholdID     string
	IncludeArchived bool
}

type AccountRepository interface {
	GetByID(ctx context.Context, id string) (*account.Account, error)
	ListByHouseholdID(ctx context.Context, params AccountListParams) ([]account.Account, error)
	Create(ctx context.Context, acct *account.Account) error
	Update(ctx context.Context, acct *account.Account) error
}
