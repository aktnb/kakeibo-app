package postgres

import (
	"context"
	"database/sql"

	"github.com/aktnb/kakeibo-app/apps/api/internal/domain/category"
	"github.com/aktnb/kakeibo-app/apps/api/internal/repository"
)

type CategoryRepository struct {
	db *sql.DB
}

func NewCategoryRepository(db *sql.DB) *CategoryRepository {
	return &CategoryRepository{db: db}
}

func (r *CategoryRepository) GetByID(ctx context.Context, id string) (*category.Category, error) {
	const query = `
SELECT id, household_id, name, kind, color, sort_order, is_archived, created_at, updated_at
FROM categories
WHERE id = $1
`

	row := getQuerier(ctx, r.db).QueryRowContext(ctx, query, id)
	cat, err := scanCategory(row)
	if err != nil {
		return nil, mapError(err)
	}

	return cat, nil
}

func (r *CategoryRepository) ListByHouseholdID(ctx context.Context, params repository.CategoryListParams) ([]category.Category, error) {
	query := `
SELECT id, household_id, name, kind, color, sort_order, is_archived, created_at, updated_at
FROM categories
WHERE household_id = $1
`
	args := []any{params.HouseholdID}

	if params.Kind != nil {
		query += ` AND kind = $2`
		args = append(args, *params.Kind)
	}
	if !params.IncludeArchived {
		query += ` AND is_archived = FALSE`
	}
	query += ` ORDER BY sort_order ASC, created_at ASC`

	rows, err := getQuerier(ctx, r.db).QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	categories := make([]category.Category, 0)
	for rows.Next() {
		cat, err := scanCategory(rows)
		if err != nil {
			return nil, err
		}
		categories = append(categories, *cat)
	}

	return categories, rows.Err()
}

func (r *CategoryRepository) Create(ctx context.Context, cat *category.Category) error {
	const query = `
INSERT INTO categories (
    household_id, name, kind, color, sort_order, is_archived
)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id, created_at, updated_at
`

	err := getQuerier(ctx, r.db).QueryRowContext(
		ctx,
		query,
		cat.HouseholdID,
		cat.Name,
		cat.Kind,
		cat.Color,
		cat.SortOrder,
		cat.IsArchived,
	).Scan(&cat.ID, &cat.CreatedAt, &cat.UpdatedAt)

	return mapError(err)
}

func (r *CategoryRepository) Update(ctx context.Context, cat *category.Category) error {
	const query = `
UPDATE categories
SET
    name = $2,
    kind = $3,
    color = $4,
    sort_order = $5,
    is_archived = $6,
    updated_at = now()
WHERE id = $1
RETURNING updated_at
`

	err := getQuerier(ctx, r.db).QueryRowContext(
		ctx,
		query,
		cat.ID,
		cat.Name,
		cat.Kind,
		cat.Color,
		cat.SortOrder,
		cat.IsArchived,
	).Scan(&cat.UpdatedAt)

	return mapError(err)
}

func scanCategory(s scanner) (*category.Category, error) {
	var cat category.Category
	var color sql.NullString

	err := s.Scan(
		&cat.ID,
		&cat.HouseholdID,
		&cat.Name,
		&cat.Kind,
		&color,
		&cat.SortOrder,
		&cat.IsArchived,
		&cat.CreatedAt,
		&cat.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	if color.Valid {
		cat.Color = &color.String
	}

	return &cat, nil
}
