package postgres

import (
	"context"
	"database/sql"

	"github.com/aktnb/kakeibo-app/apps/api/internal/domain/summary"
	"github.com/aktnb/kakeibo-app/apps/api/internal/repository"
)

type SummaryRepository struct {
	db *sql.DB
}

func NewSummaryRepository(db *sql.DB) *SummaryRepository {
	return &SummaryRepository{db: db}
}

func (r *SummaryRepository) GetMonthlyTotals(ctx context.Context, params repository.SummaryMonthlyParams) (*summary.MonthlyTotals, error) {
	const query = `
SELECT
    $2 AS month,
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense,
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) AS net,
    COUNT(*) AS entry_count
FROM entries
WHERE household_id = $1
  AND occurred_on >= to_date($2 || '-01', 'YYYY-MM-DD')
  AND occurred_on < (to_date($2 || '-01', 'YYYY-MM-DD') + INTERVAL '1 month')
`

	var out summary.MonthlyTotals
	err := getQuerier(ctx, r.db).QueryRowContext(ctx, query, params.HouseholdID, params.Month).Scan(
		&out.Month,
		&out.Income,
		&out.Expense,
		&out.Net,
		&out.EntryCount,
	)
	if err != nil {
		return nil, mapError(err)
	}

	return &out, nil
}

func (r *SummaryRepository) GetCategoryBreakdown(ctx context.Context, params repository.SummaryCategoryBreakdownParams) (*summary.CategoryBreakdown, error) {
	const query = `
WITH totals AS (
    SELECT COALESCE(SUM(e.amount), 0) AS total
    FROM entries e
    WHERE e.household_id = $1
      AND e.type = $3
      AND e.occurred_on >= to_date($2 || '-01', 'YYYY-MM-DD')
      AND e.occurred_on < (to_date($2 || '-01', 'YYYY-MM-DD') + INTERVAL '1 month')
)
SELECT
    c.id,
    c.name,
    COALESCE(SUM(e.amount), 0) AS amount,
    CASE
        WHEN t.total = 0 THEN 0
        ELSE COALESCE(SUM(e.amount), 0)::double precision / t.total::double precision
    END AS ratio,
    COUNT(e.id) AS transaction_count,
    t.total
FROM categories c
LEFT JOIN entries e
    ON e.category_id = c.id
   AND e.household_id = $1
   AND e.type = $3
   AND e.occurred_on >= to_date($2 || '-01', 'YYYY-MM-DD')
   AND e.occurred_on < (to_date($2 || '-01', 'YYYY-MM-DD') + INTERVAL '1 month')
CROSS JOIN totals t
WHERE c.household_id = $1
  AND c.kind = $3
  AND c.is_archived = FALSE
GROUP BY c.id, c.name, t.total
HAVING COALESCE(SUM(e.amount), 0) > 0
ORDER BY amount DESC, c.name ASC
`

	rows, err := getQuerier(ctx, r.db).QueryContext(ctx, query, params.HouseholdID, params.Month, params.Type)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := &summary.CategoryBreakdown{
		Month: params.Month,
		Type:  params.Type,
		Items: make([]summary.CategoryBreakdownItem, 0),
	}

	for rows.Next() {
		var item summary.CategoryBreakdownItem
		if err := rows.Scan(
			&item.CategoryID,
			&item.CategoryName,
			&item.Amount,
			&item.Ratio,
			&item.TransactionCount,
			&out.Total,
		); err != nil {
			return nil, err
		}
		out.Items = append(out.Items, item)
	}

	return out, rows.Err()
}

func (r *SummaryRepository) GetAccountBalances(ctx context.Context, params repository.SummaryAccountBalancesParams) (*summary.AccountBalances, error) {
	const query = `
WITH month_window AS (
    SELECT
        to_date($2 || '-01', 'YYYY-MM-DD') AS month_start,
        (to_date($2 || '-01', 'YYYY-MM-DD') + INTERVAL '1 month')::date AS next_month_start
),
month_deltas AS (
    SELECT
        e.account_id,
        COALESCE(SUM(
            CASE
                WHEN e.type = 'income' THEN e.amount
                ELSE -e.amount
            END
        ), 0) AS delta
    FROM entries e, month_window mw
    WHERE e.household_id = $1
      AND e.occurred_on >= mw.month_start
      AND e.occurred_on < mw.next_month_start
    GROUP BY e.account_id
)
SELECT
    a.id,
    a.name,
    a.type,
    a.current_balance - COALESCE(md.delta, 0) AS opening_balance,
    a.current_balance AS closing_balance,
    COALESCE(md.delta, 0) AS delta
FROM accounts a
LEFT JOIN month_deltas md ON md.account_id = a.id
WHERE a.household_id = $1
  AND a.is_archived = FALSE
ORDER BY a.created_at ASC
`

	rows, err := getQuerier(ctx, r.db).QueryContext(ctx, query, params.HouseholdID, params.Month)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := &summary.AccountBalances{
		Month: params.Month,
		Items: make([]summary.AccountBalanceItem, 0),
	}

	for rows.Next() {
		var item summary.AccountBalanceItem
		if err := rows.Scan(
			&item.AccountID,
			&item.AccountName,
			&item.AccountType,
			&item.OpeningBalance,
			&item.ClosingBalance,
			&item.Delta,
		); err != nil {
			return nil, err
		}
		out.TotalClosingBalance += item.ClosingBalance
		out.Items = append(out.Items, item)
	}

	return out, rows.Err()
}
