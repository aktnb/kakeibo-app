package auth

import (
	"context"
	"errors"
)

var (
	ErrUnauthorized     = errors.New("auth: unauthorized")
	ErrVerifierDisabled = errors.New("auth: verifier disabled")
)

type TokenVerifier interface {
	VerifyIDToken(ctx context.Context, token string) (*Principal, error)
}

type DisabledVerifier struct{}

func NewDisabledVerifier() *DisabledVerifier {
	return &DisabledVerifier{}
}

func (v *DisabledVerifier) VerifyIDToken(ctx context.Context, token string) (*Principal, error) {
	return nil, ErrVerifierDisabled
}
