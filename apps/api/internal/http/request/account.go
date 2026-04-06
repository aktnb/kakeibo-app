package request

type CreateAccountRequest struct {
	Name           string `json:"name"`
	Type           string `json:"type"`
	Currency       string `json:"currency"`
	OpeningBalance int64  `json:"openingBalance"`
}

type UpdateAccountRequest struct {
	Name       *string `json:"name"`
	IsArchived *bool   `json:"isArchived"`
}
