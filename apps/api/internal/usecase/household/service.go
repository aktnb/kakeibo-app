package household

import (
	"context"

	domainhousehold "github.com/aktnb/kakeibo-app/apps/api/internal/domain/household"
	domainuser "github.com/aktnb/kakeibo-app/apps/api/internal/domain/user"
	"github.com/aktnb/kakeibo-app/apps/api/internal/repository"
)

type EnsureUserInput struct {
	FirebaseUID string
	DisplayName string
}

type EnsureUserOutput struct {
	User      *domainuser.User
	Household *domainhousehold.Household
}

type GetCurrentOutput struct {
	User      *domainuser.User
	Household *domainhousehold.Household
}

type Service struct {
	txManager     repository.TxManager
	userRepo      repository.UserRepository
	householdRepo repository.HouseholdRepository
}

func NewService(
	txManager repository.TxManager,
	userRepo repository.UserRepository,
	householdRepo repository.HouseholdRepository,
) *Service {
	return &Service{
		txManager:     txManager,
		userRepo:      userRepo,
		householdRepo: householdRepo,
	}
}

func (s *Service) EnsureUser(ctx context.Context, in EnsureUserInput) (*EnsureUserOutput, error) {
	existingUser, err := s.userRepo.GetByFirebaseUID(ctx, in.FirebaseUID)
	if err == nil {
		return s.buildEnsureUserOutput(ctx, existingUser)
	}
	if err != repository.ErrNotFound {
		return nil, err
	}

	var out *EnsureUserOutput
	err = s.txManager.WithinTransaction(ctx, func(ctx context.Context) error {
		h := &domainhousehold.Household{
			Name: in.DisplayName + " household",
		}
		if err := s.householdRepo.Create(ctx, h); err != nil {
			return err
		}

		u := &domainuser.User{
			HouseholdID: h.ID,
			FirebaseUID: in.FirebaseUID,
			DisplayName: in.DisplayName,
		}
		if err := s.userRepo.Create(ctx, u); err != nil {
			return err
		}

		out = &EnsureUserOutput{User: u, Household: h}
		return nil
	})
	if err != nil {
		existingUser, getErr := s.userRepo.GetByFirebaseUID(ctx, in.FirebaseUID)
		if getErr != nil {
			return nil, err
		}
		return s.buildEnsureUserOutput(ctx, existingUser)
	}

	return out, nil
}

func (s *Service) GetCurrent(ctx context.Context, firebaseUID string) (*GetCurrentOutput, error) {
	u, err := s.userRepo.GetByFirebaseUID(ctx, firebaseUID)
	if err != nil {
		return nil, err
	}

	h, err := s.householdRepo.GetByID(ctx, u.HouseholdID)
	if err != nil {
		return nil, err
	}

	return &GetCurrentOutput{
		User:      u,
		Household: h,
	}, nil
}

func (s *Service) buildEnsureUserOutput(ctx context.Context, existingUser *domainuser.User) (*EnsureUserOutput, error) {
	h, err := s.householdRepo.GetByID(ctx, existingUser.HouseholdID)
	if err != nil {
		return nil, err
	}

	return &EnsureUserOutput{User: existingUser, Household: h}, nil
}
