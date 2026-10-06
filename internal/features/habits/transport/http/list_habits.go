package habits_transport_http

import (
	"encoding/json"
	"net/http"
	"strconv"
)

func (h *HabitsHTTPHandler) ListHabits(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	q := r.URL.Query()
	raw := q.Get("user_id")
	if raw == "" {
		http.Error(w, "user id is empty", http.StatusBadRequest)
		return
	}
	uid, err := strconv.Atoi(raw)
	if err != nil {
		http.Error(w, "error convert string to integer", http.StatusBadRequest)
		return
	}
	if uid <= 0 {
		http.Error(w, "invalid user id", http.StatusBadRequest)
		return
	}
	raw = q.Get("limit")
	limit := 0
	if raw == "" {
		limit = 20
	} else {
		limit, err = strconv.Atoi(raw)
	}
	if err != nil {
		http.Error(w, "error convert string to integer", http.StatusBadRequest)
		return
	}
	if limit <= 0 {
		http.Error(w, "invalid limit", http.StatusBadRequest)
		return
	}
	if limit >= 100 {
		limit = 100
	}
	raw = q.Get("offset")
	offset := 0
	if raw == "" {
		offset = 0
	} else {
		offset, err = strconv.Atoi(raw)
	}
	if err != nil {
		http.Error(w, "error convert string to integer", http.StatusBadRequest)
		return
	}
	if offset < 0 {
		http.Error(w, "invalid offset", http.StatusBadRequest)
		return
	}

	habits, err := h.habitService.ListHabits(ctx, uid, limit, offset)
	if err != nil {
		http.Error(w, "failed get list habits", http.StatusInternalServerError)
		return
	}
	out := make([]GetHabitResponse, 0, len(habits))
	for _, hh := range habits {
		out = append(out, GetHabitResponse{ID: hh.ID, UserId: hh.UsersID, Title: hh.Title, Description: hh.Description, BaseExp: hh.BaseEXP, StatType: hh.StatType, StatGain: hh.StatGain, CreatedAt: hh.CreatedAt})
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(out)
}
