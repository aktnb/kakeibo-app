package postgres

import (
	"context"
	"database/sql"

	"github.com/aktnb/kakeibo-app/apps/api/internal/domain/account"
	"github.com/aktnb/kakeibo-app/apps/api/internal/repository"
)

type AccountRepository struct {
	db *sql.DB
}

func NewAccountRepository(db *sql.DB) *AccountRepository {
	return &AccountRepository{db: db}
}

func (r *AccountRepository) GetByID(ctx context.Context, id string) (*account.Account, error) {
	const query = `
SELECT id, household_id, name, type, currency, opening_balance, current_balance, is_archived, created_at, updated_at
FROM accounts
WHERE id = $1
`

	row := getQuerier(ctx, r.db).QueryRowContext(ctx, query, id)
	acct, err := scanAccount(row)
	if err != nil {
		return nil, mapError(err)
	}

	return acct, nil
}

func (r *AccountRepository) ListByHouseholdID(ctx context.Context, params repository.AccountListParams) ([]account.Account, error) {
	query := `
SELECT id, household_id, name, type, currency, opening_balance, current_balance, is_archived, created_at, updated_at
FROM accounts
WHERE household_id = $1
`
	args := []any{params.HouseholdID}
	if !params.IncludeArchived {
		query += ` AND is_archived = FALSE`
	}
	query += ` ORDER BY created_at DESC`

	rows, err := getQuerier(ctx, r.db).QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	accounts := make([]account.Account, 0)
	for rows.Next() {
		acct, err := scanAccount(rows)
		if err != nil {
			return nil, err
		}
		accounts = append(accounts, *acct)
	}

	return accounts, rows.Err()
}

func (r *AccountRepository) Create(ctx context.Context, acct *account.Account) error {
	const query = `
INSERT INTO accounts (
    household_id, name, type, currency, opening_balance, current_balance, is_archived
)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id, created_at, updated_at
`

	err := getQuerier(ctx, r.db).QueryRowContext(
		ctx,
		query,
		acct.HouseholdID,
		acct.Name,
		acct.Type,
		acct.Currency,
		acct.OpeningBalance,
		acct.CurrentBalance,
		acct.IsArchived,
	).Scan(&acct.ID, &acct.CreatedAt, &acct.UpdatedAt)

	return mapError(err)
}

func (r *AccountRepository) Update(ctx context.Context, acct *account.Account) error {
	const query = `
UPDATE accounts
SET
    name = $2,
    type = $3,
    currency = $4,
    opening_balance = $5,
    current_balance = $6,
    is_archived = $7,
    updated_at = now()
WHERE id = $1
RETURNING updated_at
`

	err := getQuerier(ctx, r.db).QueryRowContext(
		ctx,
		query,
		acct.ID,
		acct.Name,
		acct.Type,
		acct.Currency,
		acct.OpeningBalance,
		acct.CurrentBalance,
		acct.IsArchived,
	).Scan(&acct.UpdatedAt)

	return mapError(err)
}

type scanner interface {
	Scan(dest ...any) error
}

func scanAccount(s scanner) (*account.Account, error) {
	var acct account.Account
	err := s.Scan(
		&acct.ID,
		&acct.HouseholdID,
		&acct.Name,
		&acct.Type,
		&acct.Currency,
		&acct.OpeningBalance,
		&acct.CurrentBalance,
		&acct.IsArchived,
		&acct.CreatedAt,
		&acct.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &acct, nil
}
