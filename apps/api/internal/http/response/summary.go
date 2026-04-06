package response

import domainsummary "github.com/aktnb/kakeibo-app/apps/api/internal/domain/summary"

func NewMonthlyTotals(v *domainsummary.MonthlyTotals) *domainsummary.MonthlyTotals { return v }
func NewCategoryBreakdown(v *domainsummary.CategoryBreakdown) *domainsummary.CategoryBreakdown {
	return v
}
func NewAccountBalances(v *domainsummary.AccountBalances) *domainsummary.AccountBalances { return v }
