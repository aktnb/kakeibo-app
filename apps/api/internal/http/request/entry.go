package request

type CreateEntryRequest struct {
	Type       string  `json:"type"`
	OccurredOn string  `json:"occurredOn"`
	AccountID  string  `json:"accountId"`
	CategoryID string  `json:"categoryId"`
	Amount     int64   `json:"amount"`
	Memo       *string `json:"memo"`
}

type UpdateEntryRequest struct {
	AccountID  *string `json:"accountId"`
	CategoryID *string `json:"categoryId"`
	OccurredOn *string `json:"occurredOn"`
	Amount     *int64  `json:"amount"`
	Memo       *string `json:"memo"`
}
