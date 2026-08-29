package main

import (
	"context"
	"database/sql"
	"dayliki/internal/config"
	"dayliki/internal/core/storage/postgres"
	"dayliki/internal/features/users/service"
	users_transport_http "dayliki/internal/features/users/transport/http"
	"fmt"
	"log"
	"net/http"

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
	userService := service.NewUserService(userRepo)
	usersHandler := users_transport_http.NewUsersHTTPHandler(userService)

	mux.HandleFunc("POST /users", usersHandler.CreateUser)

	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}
