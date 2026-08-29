package domain

import "time"

type User struct {
	ID            int
	Nick_name     string
	Email         string
	Password      string
	Password_hash string
	CreatedAt     time.Time
}
