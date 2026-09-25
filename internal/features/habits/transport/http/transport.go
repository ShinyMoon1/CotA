package habit_transport_http

import (
	"context"
	"dayliki/internal/core/domain"
)

type HabitsHTTPHandler struct {
	habitService HabitsService
}

type HabitsService interface {
	CreateHabit(ctx context.Context, habit domain.Habit) (int, error)
	GetHabit(ctx context.Context, id int) (domain.Habit, error)
}

func NewHabitsHTTPHandler(habitService HabitsService) *HabitsHTTPHandler {
	return &HabitsHTTPHandler{habitService: habitService}
}
