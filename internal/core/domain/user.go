package domain

import (
	"database/sql"
	"time"
)

type User struct {
	ID            int
	Nick_name     string
	Email         string
	Password      string
	Password_hash string
	TelegramID    sql.NullInt64
	CreatedAt     time.Time
}
