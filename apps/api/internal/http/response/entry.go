package response

import (
	"time"

	domainentry "github.com/aktnb/kakeibo-app/apps/api/internal/domain/entry"
)

type Entry struct {
	ID         string  `json:"id"`
	Type       string  `json:"type"`
	OccurredOn string  `json:"occurredOn"`
	AccountID  string  `json:"accountId"`
	CategoryID string  `json:"categoryId"`
	Amount     int64   `json:"amount"`
	Memo       *string `json:"memo,omitempty"`
	CreatedAt  string  `json:"createdAt"`
	UpdatedAt  string  `json:"updatedAt"`
}

func NewEntry(e domainentry.Entry) Entry {
	return Entry{
		ID:         e.ID,
		Type:       string(e.Type),
		OccurredOn: e.OccurredOn.Format(time.RFC3339),
		AccountID:  e.AccountID,
		CategoryID: e.CategoryID,
		Amount:     e.Amount,
		Memo:       e.Memo,
		CreatedAt:  e.CreatedAt.Format(time.RFC3339),
		UpdatedAt:  e.UpdatedAt.Format(time.RFC3339),
	}
}

func NewEntries(entries []domainentry.Entry) []Entry {
	items := make([]Entry, 0, len(entries))
	for _, e := range entries {
		items = append(items, NewEntry(e))
	}
	return items
}
