package category

import "time"

type Kind string

const (
	KindIncome  Kind = "income"
	KindExpense Kind = "expense"
)

type Category struct {
	ID          string
	HouseholdID string
	Name        string
	Kind        Kind
	Color       *string
	SortOrder   int
	IsArchived  bool
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
