package users_transport_http

import (
	"dayliki/internal/core/domain"
	"encoding/json"
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

func (h *UsersHTTPHandler) CreateUser(rw http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var req CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(rw, err.Error(), http.StatusBadRequest)
		return
	}
	id, err := h.usersService.CreateUser(ctx, domain.User{Nick_name: req.Nick_name,
		Email:    req.Email,
		Password: req.Password})
	if err != nil {
		http.Error(rw, err.Error(), http.StatusInternalServerError)
		return
	}
	resp := CreateUserResponse{ID: id}
	rw.Header().Set("Content-Type", "application/json")
	rw.WriteHeader(http.StatusCreated)
	json.NewEncoder(rw).Encode(resp)
}
