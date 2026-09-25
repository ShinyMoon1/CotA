package domain

import "errors"

var (
	ErrUserNotFound = errors.New("user not found")
	ErrEmailTaken   = errors.New("email already taken")

	ErrHabitNotFound = errors.New("habit not found")
)
