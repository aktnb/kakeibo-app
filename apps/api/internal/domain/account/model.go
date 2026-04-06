package account

import "time"

type Type string

const (
	TypeCash       Type = "cash"
	TypeBank       Type = "bank"
	TypeCreditCard Type = "credit_card"
	TypeEWallet    Type = "ewallet"
	TypeOther      Type = "other"
)

type Account struct {
	ID             string
	HouseholdID    string
	Name           string
	Type           Type
	Currency       string
	OpeningBalance int64
	CurrentBalance int64
	IsArchived     bool
	CreatedAt      time.Time
	UpdatedAt      time.Time
}
