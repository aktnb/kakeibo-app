package handler

import "testing"

func TestValidateMonth(t *testing.T) {
	t.Parallel()

	if err := validateMonth("2026-04"); err != nil {
		t.Fatalf("validateMonth() unexpected error: %v", err)
	}
	if err := validateMonth("2026-13"); err == nil {
		t.Fatal("validateMonth() expected error for invalid month")
	}
}

func TestValidateAccountType(t *testing.T) {
	t.Parallel()

	if err := validateAccountType("bank"); err != nil {
		t.Fatalf("validateAccountType() unexpected error: %v", err)
	}
	if err := validateAccountType("crypto"); err == nil {
		t.Fatal("validateAccountType() expected error for invalid type")
	}
}

func TestValidateColor(t *testing.T) {
	t.Parallel()

	valid := "#AABBCC"
	invalid := "blue"
	if err := validateColor(&valid); err != nil {
		t.Fatalf("validateColor() unexpected error: %v", err)
	}
	if err := validateColor(&invalid); err == nil {
		t.Fatal("validateColor() expected error for invalid color")
	}
}
