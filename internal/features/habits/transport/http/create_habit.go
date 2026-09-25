package habit_transport_http

import (
	"dayliki/internal/core/domain"
	"encoding/json"
	"errors"
	"net/http"
)

type CreateHabitRequest struct {
	UserID      int    `json:"user_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	BaseEXP     int    `json:"base_exp"`
	StatType    string `json:"stat_type"`
	StatGain    int    `json:"stat_gain"`
}

type CreateHabitResponse struct {
	ID int `json:"id"`
}

func (h *HabitsHTTPHandler) CreateHabit(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var req CreateHabitRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	id, err := h.habitService.CreateHabit(ctx, domain.Habit{UsersID: req.UserID, Title: req.Title, Description: req.Description, BaseEXP: req.BaseEXP, StatType: req.StatType, StatGain: req.StatGain})
	if err != nil {
		if errors.Is(err, domain.ErrUserNotFound) {
			http.Error(w, "user not found", 404)
			return
		}
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	resp := CreateHabitResponse{ID: id}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
