package postgres

import (
	"context"
	"database/sql"

	"github.com/aktnb/kakeibo-app/apps/api/internal/domain/household"
)

type HouseholdRepository struct {
	db *sql.DB
}

func NewHouseholdRepository(db *sql.DB) *HouseholdRepository {
	return &HouseholdRepository{db: db}
}

func (r *HouseholdRepository) GetByID(ctx context.Context, id string) (*household.Household, error) {
	const query = `
SELECT id, name, created_at, updated_at
FROM households
WHERE id = $1
`

	row := getQuerier(ctx, r.db).QueryRowContext(ctx, query, id)
	h, err := scanHousehold(row)
	if err != nil {
		return nil, mapError(err)
	}

	return h, nil
}

func (r *HouseholdRepository) Create(ctx context.Context, h *household.Household) error {
	const query = `
INSERT INTO households (name)
VALUES ($1)
RETURNING id, created_at, updated_at
`

	err := getQuerier(ctx, r.db).QueryRowContext(ctx, query, h.Name).Scan(&h.ID, &h.CreatedAt, &h.UpdatedAt)
	return mapError(err)
}

func scanHousehold(s scanner) (*household.Household, error) {
	var h household.Household
	err := s.Scan(&h.ID, &h.Name, &h.CreatedAt, &h.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return &h, nil
}
