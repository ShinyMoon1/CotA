package habit_transport_http

import (
	"dayliki/internal/core/domain"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"time"
)

type GetHabitResponse struct {
	ID          int       `json:"id"`
	UserId      int       `json:"user_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	BaseExp     int       `json:"base_exp"`
	StatType    string    `json:"stat_type"`
	StatGain    int       `json:"stat_gain"`
	CreatedAt   time.Time `json:"created_at"`
}

func (h *HabitsHTTPHandler) GetHabit(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}
	habit, err := h.habitService.GetHabit(r.Context(), id)
	if err != nil {
		if errors.Is(err, domain.ErrHabitNotFound) {
			http.Error(w, "habit not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	resp := GetHabitResponse{ID: habit.ID, UserId: habit.UsersID, Title: habit.Title, Description: habit.Description, BaseExp: habit.BaseEXP, StatType: habit.StatType, StatGain: habit.StatGain, CreatedAt: habit.CreatedAt}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
