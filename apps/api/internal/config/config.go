package config

import (
	"errors"
	"os"
)

type Config struct {
	Port              string
	DatabaseURL       string
	FirebaseProjectID string
	AllowInsecureAuth bool
}

func Load() (Config, error) {
	cfg := Config{
		Port:              getEnv("PORT", "8080"),
		DatabaseURL:       os.Getenv("DATABASE_URL"),
		FirebaseProjectID: os.Getenv("FIREBASE_PROJECT_ID"),
		AllowInsecureAuth: os.Getenv("ALLOW_INSECURE_AUTH") == "true",
	}

	if cfg.DatabaseURL == "" {
		return Config{}, errors.New("config: DATABASE_URL is required")
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}

	return fallback
}
