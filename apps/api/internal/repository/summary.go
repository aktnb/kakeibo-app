package repository

import (
	"context"

	"github.com/aktnb/kakeibo-app/apps/api/internal/domain/summary"
)

type SummaryMonthlyParams struct {
	HouseholdID string
	Month       string
}

type SummaryCategoryBreakdownParams struct {
	HouseholdID string
	Month       string
	Type        string
}

type SummaryAccountBalancesParams struct {
	HouseholdID string
	Month       string
}

type SummaryRepository interface {
	GetMonthlyTotals(ctx context.Context, params SummaryMonthlyParams) (*summary.MonthlyTotals, error)
	GetCategoryBreakdown(ctx context.Context, params SummaryCategoryBreakdownParams) (*summary.CategoryBreakdown, error)
	GetAccountBalances(ctx context.Context, params SummaryAccountBalancesParams) (*summary.AccountBalances, error)
}
