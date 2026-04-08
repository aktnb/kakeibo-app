package summary

type MonthlyTotals struct {
	Month      string `json:"month"`
	Income     int64  `json:"income"`
	Expense    int64  `json:"expense"`
	Net        int64  `json:"net"`
	EntryCount int64  `json:"entryCount"`
}

type CategoryBreakdownItem struct {
	CategoryID       string  `json:"categoryID"`
	CategoryName     string  `json:"categoryName"`
	Amount           int64   `json:"amount"`
	Ratio            float64 `json:"ratio"`
	TransactionCount int64   `json:"transactionCount"`
}

type CategoryBreakdown struct {
	Month string                  `json:"month"`
	Type  string                  `json:"type"`
	Total int64                   `json:"total"`
	Items []CategoryBreakdownItem `json:"items"`
}

type AccountBalanceItem struct {
	AccountID      string `json:"accountID"`
	AccountName    string `json:"accountName"`
	AccountType    string `json:"accountType"`
	OpeningBalance int64  `json:"openingBalance"`
	ClosingBalance int64  `json:"closingBalance"`
	Delta          int64  `json:"delta"`
}

type AccountBalances struct {
	Month               string               `json:"month"`
	TotalClosingBalance int64                `json:"totalClosingBalance"`
	Items               []AccountBalanceItem `json:"items"`
}
