package repository

import (
	"context"

	"github.com/aktnb/kakeibo-app/apps/api/internal/domain/user"
)

type UserRepository interface {
	GetByID(ctx context.Context, id string) (*user.User, error)
	GetByFirebaseUID(ctx context.Context, firebaseUID string) (*user.User, error)
	Create(ctx context.Context, u *user.User) error
	Update(ctx context.Context, u *user.User) error
}
