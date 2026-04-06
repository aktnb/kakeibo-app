package auth

import (
	"context"
	"net/http"
	"strings"
)

const (
	InsecureUIDHeader         = "X-Debug-Firebase-Uid"
	InsecureDisplayNameHeader = "X-Debug-Display-Name"
)

type InsecureVerifier struct{}

func NewInsecureVerifier() *InsecureVerifier {
	return &InsecureVerifier{}
}

func (v *InsecureVerifier) VerifyIDToken(ctx context.Context, token string) (*Principal, error) {
	if strings.TrimSpace(token) == "" {
		return nil, ErrUnauthorized
	}

	return &Principal{
		FirebaseUID: token,
		DisplayName: token,
	}, nil
}

func PrincipalFromHeaders(r *http.Request) *Principal {
	uid := strings.TrimSpace(r.Header.Get(InsecureUIDHeader))
	if uid == "" {
		return nil
	}

	displayName := strings.TrimSpace(r.Header.Get(InsecureDisplayNameHeader))
	if displayName == "" {
		displayName = uid
	}

	return &Principal{
		FirebaseUID: uid,
		DisplayName: displayName,
	}
}
