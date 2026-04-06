package entry

import (
	"context"
	"time"

	domainaccount "github.com/aktnb/kakeibo-app/apps/api/internal/domain/account"
	domaincategory "github.com/aktnb/kakeibo-app/apps/api/internal/domain/category"
	domainentry "github.com/aktnb/kakeibo-app/apps/api/internal/domain/entry"
	"github.com/aktnb/kakeibo-app/apps/api/internal/repository"
)

type ListInput struct {
	HouseholdID string
	From        *time.Time
	To          *time.Time
	AccountID   *string
	CategoryID  *string
	Type        *domainentry.Type
	Limit       int
	Offset      int
}

type CreateInput struct {
	HouseholdID string
	UserID      string
	AccountID   string
	CategoryID  string
	Type        domainentry.Type
	OccurredOn  time.Time
	Amount      int64
	Memo        *string
}

type UpdateInput struct {
	ID          string
	HouseholdID string
	UserID      string
	AccountID   *string
	CategoryID  *string
	OccurredOn  *time.Time
	Amount      *int64
	Memo        **string
}

type DeleteInput struct {
	ID          string
	HouseholdID string
}

type Service struct {
	txManager    repository.TxManager
	entryRepo    repository.EntryRepository
	accountRepo  repository.AccountRepository
	categoryRepo repository.CategoryRepository
}

func NewService(
	txManager repository.TxManager,
	entryRepo repository.EntryRepository,
	accountRepo repository.AccountRepository,
	categoryRepo repository.CategoryRepository,
) *Service {
	return &Service{
		txManager:    txManager,
		entryRepo:    entryRepo,
		accountRepo:  accountRepo,
		categoryRepo: categoryRepo,
	}
}

func (s *Service) List(ctx context.Context, in ListInput) ([]domainentry.Entry, error) {
	return s.entryRepo.ListByHouseholdID(ctx, repository.EntryListParams{
		HouseholdID: in.HouseholdID,
		From:        in.From,
		To:          in.To,
		AccountID:   in.AccountID,
		CategoryID:  in.CategoryID,
		Type:        in.Type,
		Limit:       in.Limit,
		Offset:      in.Offset,
	})
}

func (s *Service) Create(ctx context.Context, in CreateInput) (*domainentry.Entry, error) {
	var created *domainentry.Entry

	err := s.txManager.WithinTransaction(ctx, func(ctx context.Context) error {
		acct, cat, err := s.loadCreateTargets(ctx, in.HouseholdID, in.AccountID, in.CategoryID)
		if err != nil {
			return err
		}
		if !entryTypeMatchesCategory(in.Type, cat.Kind) {
			return repository.ErrConflict
		}

		e := &domainentry.Entry{
			HouseholdID:     in.HouseholdID,
			AccountID:       in.AccountID,
			CategoryID:      in.CategoryID,
			Type:            in.Type,
			OccurredOn:      in.OccurredOn,
			Amount:          in.Amount,
			Memo:            in.Memo,
			CreatedByUserID: in.UserID,
			UpdatedByUserID: in.UserID,
		}

		acct.CurrentBalance = applyDelta(acct.CurrentBalance, in.Type, in.Amount)

		if err := s.entryRepo.Create(ctx, e); err != nil {
			return err
		}
		if err := s.accountRepo.Update(ctx, acct); err != nil {
			return err
		}

		created = e
		return nil
	})
	if err != nil {
		return nil, err
	}

	return created, nil
}

func (s *Service) Update(ctx context.Context, in UpdateInput) (*domainentry.Entry, error) {
	var updated *domainentry.Entry

	err := s.txManager.WithinTransaction(ctx, func(ctx context.Context) error {
		current, err := s.entryRepo.GetByID(ctx, in.ID)
		if err != nil {
			return err
		}
		if current.HouseholdID != in.HouseholdID {
			return repository.ErrNotFound
		}

		previousAccountID := current.AccountID
		nextAccountID := current.AccountID
		if in.AccountID != nil {
			nextAccountID = *in.AccountID
		}

		nextCategoryID := current.CategoryID
		if in.CategoryID != nil {
			nextCategoryID = *in.CategoryID
		}

		nextOccurredOn := current.OccurredOn
		if in.OccurredOn != nil {
			nextOccurredOn = *in.OccurredOn
		}

		nextAmount := current.Amount
		if in.Amount != nil {
			nextAmount = *in.Amount
		}

		nextMemo := current.Memo
		if in.Memo != nil {
			nextMemo = *in.Memo
		}

		nextType := current.Type

		nextAccount, nextCategory, err := s.loadCreateTargets(ctx, in.HouseholdID, nextAccountID, nextCategoryID)
		if err != nil {
			return err
		}
		if !entryTypeMatchesCategory(nextType, nextCategory.Kind) {
			return repository.ErrConflict
		}

		prevAccount, err := s.accountRepo.GetByID(ctx, previousAccountID)
		if err != nil {
			return err
		}
		if prevAccount.HouseholdID != in.HouseholdID {
			return repository.ErrNotFound
		}

		prevAccount.CurrentBalance = revertDelta(prevAccount.CurrentBalance, current.Type, current.Amount)
		if prevAccount.ID == nextAccount.ID {
			prevAccount.CurrentBalance = applyDelta(prevAccount.CurrentBalance, nextType, nextAmount)
			if err := s.accountRepo.Update(ctx, prevAccount); err != nil {
				return err
			}
		} else {
			nextAccount.CurrentBalance = applyDelta(nextAccount.CurrentBalance, nextType, nextAmount)
			if err := s.accountRepo.Update(ctx, prevAccount); err != nil {
				return err
			}
			if err := s.accountRepo.Update(ctx, nextAccount); err != nil {
				return err
			}
		}

		current.AccountID = nextAccountID
		current.CategoryID = nextCategoryID
		current.OccurredOn = nextOccurredOn
		current.Amount = nextAmount
		current.Memo = nextMemo
		current.UpdatedByUserID = in.UserID

		if err := s.entryRepo.Update(ctx, current); err != nil {
			return err
		}

		updated = current
		return nil
	})
	if err != nil {
		return nil, err
	}

	return updated, nil
}

func (s *Service) Delete(ctx context.Context, in DeleteInput) error {
	return s.txManager.WithinTransaction(ctx, func(ctx context.Context) error {
		current, err := s.entryRepo.GetByID(ctx, in.ID)
		if err != nil {
			return err
		}
		if current.HouseholdID != in.HouseholdID {
			return repository.ErrNotFound
		}

		acct, err := s.accountRepo.GetByID(ctx, current.AccountID)
		if err != nil {
			return err
		}
		if acct.HouseholdID != in.HouseholdID {
			return repository.ErrNotFound
		}

		acct.CurrentBalance = revertDelta(acct.CurrentBalance, current.Type, current.Amount)

		if err := s.entryRepo.Delete(ctx, current.ID); err != nil {
			return err
		}
		if err := s.accountRepo.Update(ctx, acct); err != nil {
			return err
		}

		return nil
	})
}

func (s *Service) loadCreateTargets(ctx context.Context, householdID, accountID, categoryID string) (*domainaccount.Account, *domaincategory.Category, error) {
	acct, err := s.accountRepo.GetByID(ctx, accountID)
	if err != nil {
		return nil, nil, err
	}
	cat, err := s.categoryRepo.GetByID(ctx, categoryID)
	if err != nil {
		return nil, nil, err
	}
	if acct.HouseholdID != householdID || cat.HouseholdID != householdID {
		return nil, nil, repository.ErrNotFound
	}

	return acct, cat, nil
}

func applyDelta(balance int64, entryType domainentry.Type, amount int64) int64 {
	if entryType == domainentry.TypeIncome {
		return balance + amount
	}

	return balance - amount
}

func revertDelta(balance int64, entryType domainentry.Type, amount int64) int64 {
	if entryType == domainentry.TypeIncome {
		return balance - amount
	}

	return balance + amount
}

func entryTypeMatchesCategory(entryType domainentry.Type, kind domaincategory.Kind) bool {
	return (entryType == domainentry.TypeIncome && kind == domaincategory.KindIncome) ||
		(entryType == domainentry.TypeExpense && kind == domaincategory.KindExpense)
}
