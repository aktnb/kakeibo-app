package account

import (
	"context"

	domainaccount "github.com/aktnb/kakeibo-app/apps/api/internal/domain/account"
	"github.com/aktnb/kakeibo-app/apps/api/internal/repository"
)

type ListInput struct {
	HouseholdID     string
	IncludeArchived bool
}

type CreateInput struct {
	HouseholdID    string
	Name           string
	Type           domainaccount.Type
	Currency       string
	OpeningBalance int64
}

type UpdateInput struct {
	ID          string
	HouseholdID string
	Name        *string
	IsArchived  *bool
}

type Service struct {
	accountRepo repository.AccountRepository
}

func NewService(accountRepo repository.AccountRepository) *Service {
	return &Service{accountRepo: accountRepo}
}

func (s *Service) List(ctx context.Context, in ListInput) ([]domainaccount.Account, error) {
	return s.accountRepo.ListByHouseholdID(ctx, repository.AccountListParams{
		HouseholdID:     in.HouseholdID,
		IncludeArchived: in.IncludeArchived,
	})
}

func (s *Service) Create(ctx context.Context, in CreateInput) (*domainaccount.Account, error) {
	acct := &domainaccount.Account{
		HouseholdID:    in.HouseholdID,
		Name:           in.Name,
		Type:           in.Type,
		Currency:       in.Currency,
		OpeningBalance: in.OpeningBalance,
		CurrentBalance: in.OpeningBalance,
	}

	if err := s.accountRepo.Create(ctx, acct); err != nil {
		return nil, err
	}

	return acct, nil
}

func (s *Service) Update(ctx context.Context, in UpdateInput) (*domainaccount.Account, error) {
	acct, err := s.accountRepo.GetByID(ctx, in.ID)
	if err != nil {
		return nil, err
	}
	if acct.HouseholdID != in.HouseholdID {
		return nil, repository.ErrNotFound
	}

	if in.Name != nil {
		acct.Name = *in.Name
	}
	if in.IsArchived != nil {
		acct.IsArchived = *in.IsArchived
	}

	if err := s.accountRepo.Update(ctx, acct); err != nil {
		return nil, err
	}

	return acct, nil
}
