package users_transport_http

import (
	"dayliki/internal/core/domain"
	"encoding/json"
	"errors"
	"net/http"
)

type CreateUserRequest struct {
	Nick_name string `json:"nick_name"`
	Email     string `json:"email"`
	Password  string `json:"password"`
}

type CreateUserResponse struct {
	ID        int    `json:"id"`
	Nick_name string `json:"full_name"`
}

func (h *UsersHTTPHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var req CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	id, err := h.usersService.CreateUser(ctx, domain.User{Nick_name: req.Nick_name,
		Email:    req.Email,
		Password: req.Password})
	if err != nil {
		if errors.Is(err, domain.ErrEmailTaken) {
			http.Error(w, "email already taken", http.StatusConflict)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	resp := CreateUserResponse{ID: id}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
