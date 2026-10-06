package postgres

import (
	"context"
	"database/sql"
	"dayliki/internal/core/domain"
	"errors"
	"fmt"
	"time"

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

func (r *HabitRepository) ListHabits(ctx context.Context, userID int, limit int, offset int) ([]domain.Habit, error) {
	var habit domain.Habit
	query := "SELECT id, users_id, title, description, base_exp, stat_type, stat_gain, created_at FROM CotA.habits WHERE users_id=$1 ORDER BY id LIMIT $2 OFFSET $3"
	rows, err := r.db.QueryContext(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to select habits list: %w", err)
	}
	defer rows.Close()
	var out []domain.Habit
	for rows.Next() {
		if err := rows.Scan(&habit.ID, &habit.UsersID, &habit.Title, &habit.Description, &habit.BaseEXP, &habit.StatType, &habit.StatGain, &habit.CreatedAt); err != nil {
			return nil, fmt.Errorf("get habits: %w", err)
		}
		out = append(out, habit)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("failed select habits: %w", err)
	}
	return out, nil
}

func (r *HabitRepository) CreateHabitTx(ctx context.Context, habit domain.Habit) (int, error) {
	var id int
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return 0, fmt.Errorf("fail create tx:%w", err)
	}
	defer tx.Rollback()
	query := "INSERT INTO CotA.habits (users_id, title, description, base_exp, stat_type, stat_gain) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id"
	row := tx.QueryRowContext(ctx, query, habit.UsersID, habit.Title, habit.Description, habit.BaseEXP, habit.StatType, habit.StatGain)
	if err := row.Scan(&id); err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23503" {
			return 0, domain.ErrUserNotFound
		}
		return 0, fmt.Errorf("create habit: %w", err)
	}
	queryLogs := "INSERT INTO CotA.habit_logs (habits_id, users_id, perform_date, status) VALUES ($1, $2, $3, $4)"
	_, err = tx.ExecContext(ctx, queryLogs, id, habit.UsersID, time.Now(), "missed")
	if err != nil {
		return 0, fmt.Errorf("error insert logs into habit_logs:%w", err)
	}

	if err := tx.Commit(); err != nil {
		return 0, fmt.Errorf("failed commit habit_logs:%w", err)
	}

	return id, nil
}
