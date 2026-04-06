package auth

import (
	"context"

	firebase "firebase.google.com/go/v4"
	firebaseauth "firebase.google.com/go/v4/auth"
)

type FirebaseVerifier struct {
	client *firebaseauth.Client
}

func NewFirebaseVerifier(ctx context.Context, projectID string) (*FirebaseVerifier, error) {
	var cfg *firebase.Config
	if projectID != "" {
		cfg = &firebase.Config{ProjectID: projectID}
	}

	app, err := firebase.NewApp(ctx, cfg)
	if err != nil {
		return nil, err
	}

	client, err := app.Auth(ctx)
	if err != nil {
		return nil, err
	}

	return &FirebaseVerifier{client: client}, nil
}

func (v *FirebaseVerifier) VerifyIDToken(ctx context.Context, token string) (*Principal, error) {
	verified, err := v.client.VerifyIDToken(ctx, token)
	if err != nil {
		if firebaseauth.IsIDTokenInvalid(err) || firebaseauth.IsIDTokenExpired(err) || firebaseauth.IsIDTokenRevoked(err) {
			return nil, ErrUnauthorized
		}
		return nil, err
	}

	displayName, _ := claimString(verified.Claims, "name")
	if displayName == "" {
		displayName = verified.UID
	}

	return &Principal{
		FirebaseUID: verified.UID,
		DisplayName: displayName,
	}, nil
}

func claimString(claims map[string]any, key string) (string, bool) {
	value, ok := claims[key]
	if !ok {
		return "", false
	}

	s, ok := value.(string)
	if !ok {
		return "", false
	}

	return s, true
}
