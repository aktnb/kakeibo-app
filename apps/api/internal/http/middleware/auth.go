package middleware

import (
	"errors"
	"net"
	"net/http"
	"net/netip"
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
		if m.allowInsecureAuth && isLocalRequest(r) {
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

func isLocalRequest(r *http.Request) bool {
	host := r.Host
	if parsedHost, _, err := net.SplitHostPort(host); err == nil {
		host = parsedHost
	}
	if host == "localhost" {
		return true
	}
	if len(host) >= 2 && host[0] == '[' && host[len(host)-1] == ']' {
		host = host[1 : len(host)-1]
	}

	addr, err := netip.ParseAddr(host)
	return err == nil && addr.IsLoopback()
}

func bearerToken(value string) string {
	const prefix = "Bearer "
	if !strings.HasPrefix(value, prefix) {
		return ""
	}

	return strings.TrimSpace(strings.TrimPrefix(value, prefix))
}
