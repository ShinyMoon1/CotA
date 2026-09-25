package domain

import "time"

type Habit struct {
	ID          int
	UsersID     int
	Title       string
	Description string
	BaseEXP     int
	StatType    string
	StatGain    int
	CreatedAt   time.Time
}
