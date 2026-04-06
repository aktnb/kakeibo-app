package summary

type MonthlyTotals struct {
	Month      string
	Income     int64
	Expense    int64
	Net        int64
	EntryCount int64
}

type CategoryBreakdownItem struct {
	CategoryID       string
	CategoryName     string
	Amount           int64
	Ratio            float64
	TransactionCount int64
}

type CategoryBreakdown struct {
	Month string
	Type  string
	Total int64
	Items []CategoryBreakdownItem
}

type AccountBalanceItem struct {
	AccountID      string
	AccountName    string
	AccountType    string
	OpeningBalance int64
	ClosingBalance int64
	Delta          int64
}

type AccountBalances struct {
	Month               string
	TotalClosingBalance int64
	Items               []AccountBalanceItem
}
