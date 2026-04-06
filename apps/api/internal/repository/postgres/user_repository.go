package postgres

import (
	"context"
	"database/sql"

	"github.com/aktnb/kakeibo-app/apps/api/internal/domain/user"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*user.User, error) {
	const query = `
SELECT id, household_id, firebase_uid, display_name, created_at, updated_at
FROM users
WHERE id = $1
`

	row := getQuerier(ctx, r.db).QueryRowContext(ctx, query, id)
	u, err := scanUser(row)
	if err != nil {
		return nil, mapError(err)
	}

	return u, nil
}

func (r *UserRepository) GetByFirebaseUID(ctx context.Context, firebaseUID string) (*user.User, error) {
	const query = `
SELECT id, household_id, firebase_uid, display_name, created_at, updated_at
FROM users
WHERE firebase_uid = $1
`

	row := getQuerier(ctx, r.db).QueryRowContext(ctx, query, firebaseUID)
	u, err := scanUser(row)
	if err != nil {
		return nil, mapError(err)
	}

	return u, nil
}

func (r *UserRepository) Create(ctx context.Context, u *user.User) error {
	const query = `
INSERT INTO users (household_id, firebase_uid, display_name)
VALUES ($1, $2, $3)
RETURNING id, created_at, updated_at
`

	err := getQuerier(ctx, r.db).QueryRowContext(
		ctx,
		query,
		u.HouseholdID,
		u.FirebaseUID,
		u.DisplayName,
	).Scan(&u.ID, &u.CreatedAt, &u.UpdatedAt)

	return mapError(err)
}

func (r *UserRepository) Update(ctx context.Context, u *user.User) error {
	const query = `
UPDATE users
SET
    display_name = $2,
    updated_at = now()
WHERE id = $1
RETURNING updated_at
`

	err := getQuerier(ctx, r.db).QueryRowContext(ctx, query, u.ID, u.DisplayName).Scan(&u.UpdatedAt)
	return mapError(err)
}

func scanUser(s scanner) (*user.User, error) {
	var u user.User
	err := s.Scan(
		&u.ID,
		&u.HouseholdID,
		&u.FirebaseUID,
		&u.DisplayName,
		&u.CreatedAt,
		&u.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &u, nil
}
