package postgres

import (
	"context"
	"database/sql"
	"dayliki/internal/core/domain"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5/pgconn"
)

type HabitRepository struct {
	db *sql.DB
}

func NewHabitRepository(db *sql.DB) *HabitRepository {
	return &HabitRepository{db: db}
}

func (r *HabitRepository) CreateHabit(ctx context.Context, habit domain.Habit) (int, error) {
	var id int
	query := "INSERT INTO CotA.habits (users_id, title, description, base_exp, stat_type, stat_gain) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id"
	row := r.db.QueryRowContext(ctx, query, habit.UsersID, habit.Title, habit.Description, habit.BaseEXP, habit.StatType, habit.StatGain)
	if err := row.Scan(&id); err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23503" {
			return 0, domain.ErrUserNotFound
		}
		return 0, fmt.Errorf("create habit: %w", err)
	}
	return id, nil
}

func (r *HabitRepository) GetHabit(ctx context.Context, id int) (domain.Habit, error) {
	var habit domain.Habit
	query := "SELECT id, users_id, title, description, base_exp, stat_type, stat_gain, created_at FROM CotA.habits WHERE id = $1"
	row := r.db.QueryRowContext(ctx, query, id)
	if err := row.Scan(&habit.ID, &habit.UsersID, &habit.Title, &habit.Description, &habit.BaseEXP, &habit.StatType, &habit.StatGain, &habit.CreatedAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.Habit{}, domain.ErrHabitNotFound
		}
		return domain.Habit{}, fmt.Errorf("get habit: %w", err)
	}
	return habit, nil
}
