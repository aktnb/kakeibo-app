package entry

import "time"

type Type string

const (
	TypeIncome  Type = "income"
	TypeExpense Type = "expense"
)

type Entry struct {
	ID              string
	HouseholdID     string
	AccountID       string
	CategoryID      string
	Type            Type
	OccurredOn      time.Time
	Amount          int64
	Memo            *string
	CreatedByUserID string
	UpdatedByUserID string
	CreatedAt       time.Time
	UpdatedAt       time.Time
}
