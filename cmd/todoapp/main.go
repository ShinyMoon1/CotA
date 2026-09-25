package main

import (
	"context"
	"database/sql"
	"dayliki/internal/config"
	"dayliki/internal/core/storage/postgres"
	habit_service "dayliki/internal/features/habits/service"
	habit_transport_http "dayliki/internal/features/habits/transport/http"
	metrics "dayliki/internal/features/metrics/http"
	user_service "dayliki/internal/features/users/service"
	users_transport_http "dayliki/internal/features/users/transport/http"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("no .env file")
	}

	cfg, err := config.New()
	if err != nil {
		log.Fatal("error env file", err)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello!"))
	})
	dsn := fmt.Sprintf("postgres://%s:%s@localhost:5432/%s?sslmode=disable",
		cfg.DBUser, cfg.DBPassword, cfg.DBName)
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		log.Fatal("Error open connection to db", err)
	}

	err = db.PingContext(context.Background())
	if err != nil {
		log.Fatal("Failed ping db", err)
	}
	log.Println("Server pinging")

	userRepo := postgres.NewUserRepository(db)
	stats := func(ctx context.Context, job user_service.UserRegistered) error {
		err := userRepo.CreateCharacterStats(ctx, job.UserID)
		if err != nil {
			log.Println("Failed to add stats", err)
		}
		return nil
	}
	pool := user_service.NewPool(10, stats)
	pool.Start(5)
	userService := user_service.NewUserService(userRepo, pool)
	usersHandler := users_transport_http.NewUsersHTTPHandler(userService)

	habitRepo := postgres.NewHabitRepository(db)
	habitService := habit_service.NewHabitService(habitRepo)
	habitHandler := habit_transport_http.NewHabitsHTTPHandler(habitService)

	counter := &metrics.RequestCounter{}
	mux.HandleFunc("GET /metrics", counter.Handler)

	mux.HandleFunc("POST /users", usersHandler.CreateUser)
	mux.HandleFunc("GET /users/{id}", usersHandler.GetUser)

	mux.HandleFunc("POST /habits", habitHandler.CreateHabit)
	mux.HandleFunc("GET /habits/{id}", habitHandler.GetHabit)

	srv := &http.Server{Addr: cfg.AppPort, Handler: counter.Middleware(mux)}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s", err)
		}
	}()

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	<-ctx.Done()

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	srv.Shutdown(shutdownCtx)
	pool.Stop()
}
