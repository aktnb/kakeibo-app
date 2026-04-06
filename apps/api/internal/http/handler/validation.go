package handler

import (
	"errors"
	"regexp"
	"strings"
	"time"

	domainaccount "github.com/aktnb/kakeibo-app/apps/api/internal/domain/account"
	domaincategory "github.com/aktnb/kakeibo-app/apps/api/internal/domain/category"
	domainentry "github.com/aktnb/kakeibo-app/apps/api/internal/domain/entry"
)

var (
	errInvalidAccountType  = errors.New("invalid account type")
	errInvalidCategoryKind = errors.New("invalid category kind")
	errInvalidEntryType    = errors.New("invalid entry type")
	errInvalidCurrency     = errors.New("invalid currency")
	errInvalidColor        = errors.New("invalid color")
	errInvalidMonth        = errors.New("invalid month")
	errInvalidAmount       = errors.New("invalid amount")
	errInvalidSortOrder    = errors.New("invalid sort order")
)

var (
	currencyPattern = regexp.MustCompile(`^[A-Z]{3}$`)
	colorPattern    = regexp.MustCompile(`^#[0-9A-Fa-f]{6}$`)
)

func validateAccountType(value string) error {
	switch domainaccount.Type(value) {
	case domainaccount.TypeCash, domainaccount.TypeBank, domainaccount.TypeCreditCard, domainaccount.TypeEWallet, domainaccount.TypeOther:
		return nil
	default:
		return errInvalidAccountType
	}
}

func validateCategoryKind(value string) error {
	switch domaincategory.Kind(value) {
	case domaincategory.KindIncome, domaincategory.KindExpense:
		return nil
	default:
		return errInvalidCategoryKind
	}
}

func validateEntryType(value string) error {
	switch domainentry.Type(value) {
	case domainentry.TypeIncome, domainentry.TypeExpense:
		return nil
	default:
		return errInvalidEntryType
	}
}

func validateCurrency(value string) error {
	if currencyPattern.MatchString(strings.TrimSpace(value)) {
		return nil
	}

	return errInvalidCurrency
}

func validateColor(value *string) error {
	if value == nil || *value == "" {
		return nil
	}
	if colorPattern.MatchString(*value) {
		return nil
	}

	return errInvalidColor
}

func validateMonth(value string) error {
	if _, err := time.Parse("2006-01", value); err != nil {
		return errInvalidMonth
	}

	return nil
}

func validateAmount(value int64) error {
	if value > 0 {
		return nil
	}

	return errInvalidAmount
}

func validateSortOrder(value int) error {
	if value >= 0 {
		return nil
	}

	return errInvalidSortOrder
}
