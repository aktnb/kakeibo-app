package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/aktnb/kakeibo-app/apps/api/internal/auth"
)

func TestRequireRejectsMissingBearerToken(t *testing.T) {
	t.Parallel()

	mw := NewAuthMiddleware(auth.NewDisabledVerifier(), false)
	next := mw.Require(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodGet, "/api/v1/me", nil)
	rec := httptest.NewRecorder()
	next.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusUnauthorized)
	}
}

func TestRequireAcceptsInsecureDebugHeaders(t *testing.T) {
	t.Parallel()

	mw := NewAuthMiddleware(auth.NewDisabledVerifier(), true)
	next := mw.Require(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		principal, ok := auth.PrincipalFromContext(r.Context())
		if !ok || principal.FirebaseUID != "debug-user" {
			t.Fatal("principal not found in context")
		}
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodGet, "/api/v1/me", nil)
	req.Header.Set(auth.InsecureUIDHeader, "debug-user")
	req.Header.Set(auth.InsecureDisplayNameHeader, "Debug User")
	rec := httptest.NewRecorder()
	next.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusOK)
	}
}
