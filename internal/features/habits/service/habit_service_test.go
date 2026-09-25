package habit_service_test

import (
	"context"
	"dayliki/internal/core/domain"
	habit_service "dayliki/internal/features/habits/service"
	"errors"
	"testing"
)

type fakeHabitRepo struct {
	createdFunc func(ctx context.Context, habit domain.Habit) (int, error)
	getFunc     func(ctx context.Context, id int) (domain.Habit, error)
}

func (f *fakeHabitRepo) CreateHabit(ctx context.Context, habit domain.Habit) (int, error) {
	return f.createdFunc(ctx, habit)
}

func (f *fakeHabitRepo) GetHabit(ctx context.Context, id int) (domain.Habit, error) {
	return f.getFunc(ctx, id)
}

func TestCreateHabit(t *testing.T) {
	fake := &fakeHabitRepo{createdFunc: func(ctx context.Context, habit domain.Habit) (int, error) { return 1, nil }}
	svc := habit_service.NewHabitService(fake)
	tests := []struct {
		name    string
		habit   domain.Habit
		wantID  int
		wantErr bool
	}{
		{"valid habit", domain.Habit{UsersID: 1, Title: "qwe", Description: "aasd", BaseEXP: 1, StatType: "intellect", StatGain: 1}, 1, false},
		{"empty user id", domain.Habit{Title: "qwe", Description: "aasd", BaseEXP: 1, StatType: "intellect", StatGain: 1}, 1, true},
		{"empty title", domain.Habit{UsersID: 1, Description: "aasd", BaseEXP: 1, StatType: "intellect", StatGain: 1}, 1, true},
		{"empty base exp", domain.Habit{UsersID: 1, Title: "qwe", Description: "aasd", StatType: "intellect", StatGain: 1}, 1, true},
		{"empty stat gain", domain.Habit{UsersID: 1, Title: "qwe", Description: "aasd", BaseEXP: 1, StatType: "intellect"}, 1, true},
		{"empty stat type", domain.Habit{UsersID: 1, Title: "qwe", Description: "aasd", BaseEXP: 1, StatGain: 1}, 1, true},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			id, err := svc.CreateHabit(t.Context(), tc.habit)
			if tc.wantErr {
				if err == nil {
					t.Fatalf("expected error, got nil")
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if id != tc.wantID {
				t.Errorf("got id=%d, want %d", id, tc.wantID)
			}
		})
	}
}

func TestGetHabit(t *testing.T) {
	fake := &fakeHabitRepo{getFunc: func(ctx context.Context, id int) (domain.Habit, error) {
		if id == 999 {
			return domain.Habit{}, errors.New("not found")
		}
		return domain.Habit{ID: id, UsersID: 1, Title: "qwe", Description: "aasd", BaseEXP: 1, StatType: "intellect", StatGain: 1}, nil
	}}

	svc := habit_service.NewHabitService(fake)
	tests := []struct {
		name      string
		id        int
		wantHabit domain.Habit
		wantErr   bool
	}{
		{"valid id", 1, domain.Habit{ID: 1, UsersID: 1, Title: "qwe", Description: "aasd", BaseEXP: 1, StatType: "intellect", StatGain: 1}, false},
		{"empty id", 0, domain.Habit{UsersID: 1, Title: "qwe", Description: "aasd", BaseEXP: 1, StatType: "intellect", StatGain: 1}, true},
		{"id not found", 999, domain.Habit{ID: 1, UsersID: 1, Title: "qwe", Description: "aasd", BaseEXP: 1, StatType: "intellect", StatGain: 1}, true},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			habit, err := svc.GetHabit(t.Context(), tc.id)
			if tc.wantErr {
				if err == nil {
					t.Fatalf("expected error, got nil")
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if habit != tc.wantHabit {
				t.Errorf("got habit=%v, want %d", habit, tc.wantHabit.ID)
			}
		})
	}
}
