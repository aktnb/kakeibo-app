package postgres

import (
	"database/sql"
	"errors"

	"github.com/aktnb/kakeibo-app/apps/api/internal/repository"
)

func mapError(err error) error {
	if err == nil {
		return nil
	}
	if errors.Is(err, sql.ErrNoRows) {
		return repository.ErrNotFound
	}

	return err
}
