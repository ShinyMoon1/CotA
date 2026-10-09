package users_transport_http

import (
	"encoding/json"
	"io"
	"net/http"
)

func (h *UsersHTTPHandler) AuthTelegram(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "failed to read body request", http.StatusBadRequest)
		return
	}
	token, err := h.usersService.AuthTelegram(ctx, string(body))
	if err != nil {
		http.Error(w, "failed to auth", http.StatusUnauthorized)
		return
	}

	resp := LoginResponse{Token: token}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(resp)
}
