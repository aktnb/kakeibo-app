package middleware

import (
	"errors"
	"net/http"
	"strings"

	"github.com/aktnb/kakeibo-app/apps/api/internal/auth"
	httpresponse "github.com/aktnb/kakeibo-app/apps/api/internal/http/response"
)

type AuthMiddleware struct {
	verifier          auth.TokenVerifier
	allowInsecureAuth bool
}

func NewAuthMiddleware(verifier auth.TokenVerifier, allowInsecureAuth bool) *AuthMiddleware {
	return &AuthMiddleware{
		verifier:          verifier,
		allowInsecureAuth: allowInsecureAuth,
	}
}

func (m *AuthMiddleware) Require(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if m.allowInsecureAuth {
			if principal := auth.PrincipalFromHeaders(r); principal != nil {
				next.ServeHTTP(w, r.WithContext(auth.WithPrincipal(r.Context(), principal)))
				return
			}
		}

		token := bearerToken(r.Header.Get("Authorization"))
		if token == "" {
			httpresponse.WriteError(w, http.StatusUnauthorized, "unauthorized", "missing bearer token")
			return
		}

		principal, err := m.verifier.VerifyIDToken(r.Context(), token)
		if err != nil {
			status := http.StatusUnauthorized
			code := "unauthorized"
			message := "invalid auth token"
			if errors.Is(err, auth.ErrVerifierDisabled) {
				status = http.StatusServiceUnavailable
				code = "auth_not_configured"
				message = "auth verifier is not configured"
			}
			httpresponse.WriteError(w, status, code, message)
			return
		}

		next.ServeHTTP(w, r.WithContext(auth.WithPrincipal(r.Context(), principal)))
	})
}

func bearerToken(value string) string {
	const prefix = "Bearer "
	if !strings.HasPrefix(value, prefix) {
		return ""
	}

	return strings.TrimSpace(strings.TrimPrefix(value, prefix))
}
