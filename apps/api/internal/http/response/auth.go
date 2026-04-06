package response

import (
	domainhousehold "github.com/aktnb/kakeibo-app/apps/api/internal/domain/household"
	domainuser "github.com/aktnb/kakeibo-app/apps/api/internal/domain/user"
)

type User struct {
	ID          string `json:"id"`
	FirebaseUID string `json:"firebaseUid"`
	DisplayName string `json:"displayName"`
}

type Household struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type SessionResponse struct {
	User      User      `json:"user"`
	Household Household `json:"household"`
}

func NewSessionResponse(user *domainuser.User, household *domainhousehold.Household) SessionResponse {
	return SessionResponse{
		User: User{
			ID:          user.ID,
			FirebaseUID: user.FirebaseUID,
			DisplayName: user.DisplayName,
		},
		Household: Household{
			ID:   household.ID,
			Name: household.Name,
		},
	}
}
