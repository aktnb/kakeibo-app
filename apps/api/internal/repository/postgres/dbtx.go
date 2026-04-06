package postgres

import (
	"context"
	"database/sql"
)

type dbtx interface {
	ExecContext(ctx context.Context, query string, args ...any) (sql.Result, error)
	QueryContext(ctx context.Context, query string, args ...any) (*sql.Rows, error)
	QueryRowContext(ctx context.Context, query string, args ...any) *sql.Row
}

type txContextKey struct{}

func getQuerier(ctx context.Context, db *sql.DB) dbtx {
	tx, ok := ctx.Value(txContextKey{}).(*sql.Tx)
	if ok && tx != nil {
		return tx
	}

	return db
}
