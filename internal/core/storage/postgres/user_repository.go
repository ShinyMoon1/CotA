package postgres

import (
	"context"
	"database/sql"
	"dayliki/internal/core/domain"
	"fmt"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) CreateUser(ctx context.Context, user domain.User) (int, error) {
	var id int
	query := "INSERT INTO CotA.users (nick_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id"
	row := r.db.QueryRowContext(ctx, query, user.Nick_name, user.Email, user.Password_hash)
	if err := row.Scan(&id); err != nil {
		return 0, fmt.Errorf("create user: %w", err)
	}
	return id, nil
}

func (r *UserRepository) GetUser(ctx context.Context, id int) (domain.User, error) {
	var user domain.User
	query := "SELECT id, nick_name, email, created_at FROM CotA.users WHERE id = $1"
	row := r.db.QueryRowContext(ctx, query, id)
	if err := row.Scan(&user.ID, &user.Nick_name, &user.Email, &user.CreatedAt); err != nil {
		return domain.User{}, fmt.Errorf("get user: %w", err)
	}
	return user, nil
}
