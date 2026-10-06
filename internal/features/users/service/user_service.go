package service

import (
	"context"
	"errors"
	"time"

	"dayliki/internal/core/domain"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type UserRepository interface {
	CreateUser(ctx context.Context, user domain.User) (int, error)
	GetUser(ctx context.Context, id int) (domain.User, error)
	GetUserByEmail(ctx context.Context, email string) (domain.User, error)
}

type UserService struct {
	userRepo  UserRepository
	pool      *Pool
	jwtSecret string
}

func NewUserService(userRepo UserRepository, pool *Pool, jwtSecret string) *UserService {
	return &UserService{userRepo: userRepo, pool: pool, jwtSecret: jwtSecret}
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
		return domain.User{}, domain.ErrInvalidInput
	}
	user, err := s.userRepo.GetUser(ctx, id)
	if err != nil {
		return domain.User{}, err
	}
	return user, nil
}

func (s *UserService) Login(ctx context.Context, email string, password string) (string, error) {
	user, err := s.userRepo.GetUserByEmail(ctx, email)
	if err != nil {
		return "", errors.New("Failed to get user by email")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password_hash), []byte(password)); err != nil {
		return "", errors.New("wrong password")
	}

	claims := jwt.MapClaims{"sub": user.ID, "exp": time.Now().Add(24 * time.Hour).Unix()}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString([]byte(s.jwtSecret))
}
