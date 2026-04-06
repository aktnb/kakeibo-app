package summary

import (
	"context"

	domainsummary "github.com/aktnb/kakeibo-app/apps/api/internal/domain/summary"
	"github.com/aktnb/kakeibo-app/apps/api/internal/repository"
)

type MonthlyTotalsInput struct {
	HouseholdID string
	Month       string
}

type CategoryBreakdownInput struct {
	HouseholdID string
	Month       string
	Type        string
}

type AccountBalancesInput struct {
	HouseholdID string
	Month       string
}

type Service struct {
	summaryRepo repository.SummaryRepository
}

func NewService(summaryRepo repository.SummaryRepository) *Service {
	return &Service{summaryRepo: summaryRepo}
}

func (s *Service) GetMonthlyTotals(ctx context.Context, in MonthlyTotalsInput) (*domainsummary.MonthlyTotals, error) {
	return s.summaryRepo.GetMonthlyTotals(ctx, repository.SummaryMonthlyParams{
		HouseholdID: in.HouseholdID,
		Month:       in.Month,
	})
}

func (s *Service) GetCategoryBreakdown(ctx context.Context, in CategoryBreakdownInput) (*domainsummary.CategoryBreakdown, error) {
	return s.summaryRepo.GetCategoryBreakdown(ctx, repository.SummaryCategoryBreakdownParams{
		HouseholdID: in.HouseholdID,
		Month:       in.Month,
		Type:        in.Type,
	})
}

func (s *Service) GetAccountBalances(ctx context.Context, in AccountBalancesInput) (*domainsummary.AccountBalances, error) {
	return s.summaryRepo.GetAccountBalances(ctx, repository.SummaryAccountBalancesParams{
		HouseholdID: in.HouseholdID,
		Month:       in.Month,
	})
}
