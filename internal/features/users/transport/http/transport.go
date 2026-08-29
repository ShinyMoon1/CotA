package users_transport_http

import (
	"context"
	"dayliki/internal/core/domain"
)

type UsersHTTPHandler struct {
	usersService UsersService
}

type UsersService interface {
	CreateUser(ctx context.Context, user domain.User) (int, error)
}

func NewUsersHTTPHandler(usersServise UsersService) *UsersHTTPHandler {
	return &UsersHTTPHandler{
		usersService: usersServise,
	}
}
