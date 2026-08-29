package service

import (
	"context"
	"dayliki/internal/core/domain"
	"errors"

	"golang.org/x/crypto/bcrypt"
)

type UserRepository interface {
	CreateUser(ctx context.Context, user domain.User) (int, error)
}

type UserService struct {
	userRepo UserRepository
}

func NewUserService(userRepo UserRepository) *UserService {
	return &UserService{userRepo: userRepo}
}

func (s *UserService) CreateUser(ctx context.Context, user domain.User) (int, error) {
	if user.Nick_name == "" {
		return 0, errors.New("nick name is required")
	}

	if user.Email == "" {
		return 0, errors.New("email is required")
	}

	password := []byte(user.Password)

	hash, err := bcrypt.GenerateFromPassword(password, bcrypt.DefaultCost)
	if err != nil {
		return 0, err
	}
	user.Password_hash = string(hash)

	id, err := s.userRepo.CreateUser(ctx, user)
	if err != nil {
		return 0, err
	}
	return id, nil
}
