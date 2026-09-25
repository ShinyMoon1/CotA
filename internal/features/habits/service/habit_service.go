package habit_service

import (
	"context"
	"dayliki/internal/core/domain"
	"errors"
)

type HabitRepository interface {
	CreateHabit(ctx context.Context, habit domain.Habit) (int, error)
	GetHabit(ctx context.Context, id int) (domain.Habit, error)
}

type HabitService struct {
	habitRepo HabitRepository
}

func NewHabitService(habitRepo HabitRepository) *HabitService {
	return &HabitService{habitRepo: habitRepo}
}

func (s *HabitService) CreateHabit(ctx context.Context, habit domain.Habit) (int, error) {

	if habit.UsersID == 0 {
		return 0, errors.New("UsersID is empty")
	}

	if habit.Title == "" {
		return 0, errors.New("Title is empty")
	}

	if habit.BaseEXP == 0 {
		return 0, errors.New("BaseEXP is empty")
	}

	if habit.StatGain == 0 {
		return 0, errors.New("StatGain is empty")
	}

	if _, ok := domain.AllowedStatTypes[habit.StatType]; !ok {
		return 0, errors.New("StatType is unknown")
	}

	id, err := s.habitRepo.CreateHabit(ctx, habit)
	if err != nil {
		return 0, err
	}

	return id, nil
}

func (s *HabitService) GetHabit(ctx context.Context, id int) (domain.Habit, error) {
	if id <= 0 {
		return domain.Habit{}, errors.New("invalid user id")
	}
	habit, err := s.habitRepo.GetHabit(ctx, id)
	if err != nil {
		return domain.Habit{}, err
	}
	return habit, nil
}
