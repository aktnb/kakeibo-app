package response

import (
	"time"

	domainaccount "github.com/aktnb/kakeibo-app/apps/api/internal/domain/account"
)

type Account struct {
	ID             string `json:"id"`
	Name           string `json:"name"`
	Type           string `json:"type"`
	Currency       string `json:"currency"`
	OpeningBalance int64  `json:"openingBalance"`
	CurrentBalance int64  `json:"currentBalance"`
	IsArchived     bool   `json:"isArchived"`
	CreatedAt      string `json:"createdAt"`
	UpdatedAt      string `json:"updatedAt"`
}

func NewAccount(acct domainaccount.Account) Account {
	return Account{
		ID:             acct.ID,
		Name:           acct.Name,
		Type:           string(acct.Type),
		Currency:       acct.Currency,
		OpeningBalance: acct.OpeningBalance,
		CurrentBalance: acct.CurrentBalance,
		IsArchived:     acct.IsArchived,
		CreatedAt:      acct.CreatedAt.Format(time.RFC3339),
		UpdatedAt:      acct.UpdatedAt.Format(time.RFC3339),
	}
}

func NewAccounts(accounts []domainaccount.Account) []Account {
	items := make([]Account, 0, len(accounts))
	for _, acct := range accounts {
		items = append(items, NewAccount(acct))
	}
	return items
}
