package postgres

import (
	"context"
	"database/sql"
	"strconv"
	"strings"

	"github.com/aktnb/kakeibo-app/apps/api/internal/domain/entry"
	"github.com/aktnb/kakeibo-app/apps/api/internal/repository"
)

type EntryRepository struct {
	db *sql.DB
}

func NewEntryRepository(db *sql.DB) *EntryRepository {
	return &EntryRepository{db: db}
}

func (r *EntryRepository) GetByID(ctx context.Context, id string) (*entry.Entry, error) {
	const query = `
SELECT id, household_id, account_id, category_id, type, occurred_on, amount, memo, created_by_user_id, updated_by_user_id, created_at, updated_at
FROM entries
WHERE id = $1
`

	row := getQuerier(ctx, r.db).QueryRowContext(ctx, query, id)
	e, err := scanEntry(row)
	if err != nil {
		return nil, mapError(err)
	}

	return e, nil
}

func (r *EntryRepository) ListByHouseholdID(ctx context.Context, params repository.EntryListParams) ([]entry.Entry, error) {
	query := `
SELECT id, household_id, account_id, category_id, type, occurred_on, amount, memo, created_by_user_id, updated_by_user_id, created_at, updated_at
FROM entries
WHERE household_id = $1
`
	args := []any{params.HouseholdID}

	if params.From != nil {
		query += ` AND occurred_on >= $` + placeholder(len(args)+1)
		args = append(args, *params.From)
	}
	if params.To != nil {
		query += ` AND occurred_on <= $` + placeholder(len(args)+1)
		args = append(args, *params.To)
	}
	if params.AccountID != nil {
		query += ` AND account_id = $` + placeholder(len(args)+1)
		args = append(args, *params.AccountID)
	}
	if params.CategoryID != nil {
		query += ` AND category_id = $` + placeholder(len(args)+1)
		args = append(args, *params.CategoryID)
	}
	if params.Type != nil {
		query += ` AND type = $` + placeholder(len(args)+1)
		args = append(args, *params.Type)
	}

	query += ` ORDER BY occurred_on DESC, created_at DESC`
	if params.Limit > 0 {
		query += ` LIMIT $` + placeholder(len(args)+1)
		args = append(args, params.Limit)
	}
	if params.Offset > 0 {
		query += ` OFFSET $` + placeholder(len(args)+1)
		args = append(args, params.Offset)
	}

	rows, err := getQuerier(ctx, r.db).QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	entries := make([]entry.Entry, 0)
	for rows.Next() {
		e, err := scanEntry(rows)
		if err != nil {
			return nil, err
		}
		entries = append(entries, *e)
	}

	return entries, rows.Err()
}

func (r *EntryRepository) Create(ctx context.Context, e *entry.Entry) error {
	const query = `
INSERT INTO entries (
    household_id, account_id, category_id, type, occurred_on, amount, memo, created_by_user_id, updated_by_user_id
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING id, created_at, updated_at
`

	err := getQuerier(ctx, r.db).QueryRowContext(
		ctx,
		query,
		e.HouseholdID,
		e.AccountID,
		e.CategoryID,
		e.Type,
		e.OccurredOn,
		e.Amount,
		e.Memo,
		e.CreatedByUserID,
		e.UpdatedByUserID,
	).Scan(&e.ID, &e.CreatedAt, &e.UpdatedAt)

	return mapError(err)
}

func (r *EntryRepository) Update(ctx context.Context, e *entry.Entry) error {
	const query = `
UPDATE entries
SET
    account_id = $2,
    category_id = $3,
    type = $4,
    occurred_on = $5,
    amount = $6,
    memo = $7,
    updated_by_user_id = $8,
    updated_at = now()
WHERE id = $1
RETURNING updated_at
`

	err := getQuerier(ctx, r.db).QueryRowContext(
		ctx,
		query,
		e.ID,
		e.AccountID,
		e.CategoryID,
		e.Type,
		e.OccurredOn,
		e.Amount,
		e.Memo,
		e.UpdatedByUserID,
	).Scan(&e.UpdatedAt)

	return mapError(err)
}

func (r *EntryRepository) Delete(ctx context.Context, id string) error {
	const query = `DELETE FROM entries WHERE id = $1`

	result, err := getQuerier(ctx, r.db).ExecContext(ctx, query, id)
	if err != nil {
		return err
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return repository.ErrNotFound
	}

	return nil
}

func scanEntry(s scanner) (*entry.Entry, error) {
	var e entry.Entry
	var memo sql.NullString

	err := s.Scan(
		&e.ID,
		&e.HouseholdID,
		&e.AccountID,
		&e.CategoryID,
		&e.Type,
		&e.OccurredOn,
		&e.Amount,
		&memo,
		&e.CreatedByUserID,
		&e.UpdatedByUserID,
		&e.CreatedAt,
		&e.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	if memo.Valid {
		e.Memo = &memo.String
	}

	return &e, nil
}

func placeholder(i int) string {
	return strings.TrimSpace(strconv.Itoa(i))
}
