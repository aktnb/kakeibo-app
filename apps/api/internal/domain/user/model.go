package user

import "time"

type User struct {
	ID          string
	HouseholdID string
	FirebaseUID string
	DisplayName string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
