package service

import (
	"context"
	"errors"

	"dayliki/internal/core/domain"
	"golang.org/x/crypto/bcrypt"
)

type UserRepository interface {
	CreateUser(ctx context.Context, user domain.User) (int, error)
	GetUser(ctx context.Context, id int) (domain.User, error)
}

type UserService struct {
	userRepo UserRepository
	pool     *Pool
}

func NewUserService(userRepo UserRepository, pool *Pool) *UserService {
	return &UserService{userRepo: userRepo, pool: pool}
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

	if s.pool == nil {
		return 0, errors.New("error to submit job")
	}
	s.pool.Submit(UserRegistered{UserID: id})
	return id, nil
}

func (s *UserService) GetUser(ctx context.Context, id int) (domain.User, error) {
	if id <= 0 {
		return domain.User{}, errors.New("invalid user id")
	}
	user, err := s.userRepo.GetUser(ctx, id)
	if err != nil {
		return domain.User{}, err
	}
	return user, nil
}
