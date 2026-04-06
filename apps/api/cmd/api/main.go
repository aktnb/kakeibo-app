package main

import (
	"context"
	"database/sql"
	"log"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"github.com/aktnb/kakeibo-app/apps/api/internal/auth"
	"github.com/aktnb/kakeibo-app/apps/api/internal/config"
	httphandler "github.com/aktnb/kakeibo-app/apps/api/internal/http/handler"
	"github.com/aktnb/kakeibo-app/apps/api/internal/http/middleware"
	"github.com/aktnb/kakeibo-app/apps/api/internal/repository/postgres"
	"github.com/aktnb/kakeibo-app/apps/api/internal/router"
	accountusecase "github.com/aktnb/kakeibo-app/apps/api/internal/usecase/account"
	categoryusecase "github.com/aktnb/kakeibo-app/apps/api/internal/usecase/category"
	entryusecase "github.com/aktnb/kakeibo-app/apps/api/internal/usecase/entry"
	householdusecase "github.com/aktnb/kakeibo-app/apps/api/internal/usecase/household"
	summaryusecase "github.com/aktnb/kakeibo-app/apps/api/internal/usecase/summary"
	_ "github.com/jackc/pgx/v5/stdlib"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	db, err := sql.Open("pgx", cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	if err := db.PingContext(ctx); err != nil {
		log.Fatal(err)
	}

	txManager := postgres.NewTxManager(db)
	householdRepo := postgres.NewHouseholdRepository(db)
	userRepo := postgres.NewUserRepository(db)
	accountRepo := postgres.NewAccountRepository(db)
	categoryRepo := postgres.NewCategoryRepository(db)
	entryRepo := postgres.NewEntryRepository(db)
	summaryRepo := postgres.NewSummaryRepository(db)

	householdService := householdusecase.NewService(txManager, userRepo, householdRepo)
	accountService := accountusecase.NewService(accountRepo)
	categoryService := categoryusecase.NewService(categoryRepo)
	entryService := entryusecase.NewService(txManager, entryRepo, accountRepo, categoryRepo)
	summaryService := summaryusecase.NewService(summaryRepo)

	var verifier auth.TokenVerifier
	if cfg.AllowInsecureAuth {
		verifier = auth.NewInsecureVerifier()
	} else {
		verifier, err = auth.NewFirebaseVerifier(ctx, cfg.FirebaseProjectID)
		if err != nil {
			log.Fatal(err)
		}
	}

	health := httphandler.NewHealthHandler(db)
	authHandler := httphandler.NewAuthHandler(householdService)
	accountHandler := httphandler.NewAccountHandler(accountService, householdService)
	categoryHandler := httphandler.NewCategoryHandler(categoryService, householdService)
	entryHandler := httphandler.NewEntryHandler(entryService, householdService)
	summaryHandler := httphandler.NewSummaryHandler(summaryService, householdService)
	authMiddleware := middleware.NewAuthMiddleware(verifier, cfg.AllowInsecureAuth)

	r := router.New(router.Dependencies{
		HealthHandler:   health,
		AuthHandler:     authHandler,
		AccountHandler:  accountHandler,
		CategoryHandler: categoryHandler,
		EntryHandler:    entryHandler,
		SummaryHandler:  summaryHandler,
		AuthMiddleware:  authMiddleware,
	})

	server := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           r,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		<-ctx.Done()

		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := server.Shutdown(shutdownCtx); err != nil {
			log.Printf("server shutdown error: %v", err)
		}
	}()

	log.Printf("api listening on :%s", cfg.Port)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}
