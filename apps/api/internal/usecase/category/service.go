package category

import (
	"context"

	domaincategory "github.com/aktnb/kakeibo-app/apps/api/internal/domain/category"
	"github.com/aktnb/kakeibo-app/apps/api/internal/repository"
)

type ListInput struct {
	HouseholdID     string
	Kind            *domaincategory.Kind
	IncludeArchived bool
}

type CreateInput struct {
	HouseholdID string
	Name        string
	Kind        domaincategory.Kind
	Color       *string
	SortOrder   int
}

type UpdateInput struct {
	ID          string
	HouseholdID string
	Name        *string
	Color       **string
	SortOrder   *int
	IsArchived  *bool
}

type Service struct {
	categoryRepo repository.CategoryRepository
}

func NewService(categoryRepo repository.CategoryRepository) *Service {
	return &Service{categoryRepo: categoryRepo}
}

func (s *Service) List(ctx context.Context, in ListInput) ([]domaincategory.Category, error) {
	return s.categoryRepo.ListByHouseholdID(ctx, repository.CategoryListParams{
		HouseholdID:     in.HouseholdID,
		Kind:            in.Kind,
		IncludeArchived: in.IncludeArchived,
	})
}

func (s *Service) Create(ctx context.Context, in CreateInput) (*domaincategory.Category, error) {
	cat := &domaincategory.Category{
		HouseholdID: in.HouseholdID,
		Name:        in.Name,
		Kind:        in.Kind,
		Color:       in.Color,
		SortOrder:   in.SortOrder,
	}

	if err := s.categoryRepo.Create(ctx, cat); err != nil {
		return nil, err
	}

	return cat, nil
}

func (s *Service) Update(ctx context.Context, in UpdateInput) (*domaincategory.Category, error) {
	cat, err := s.categoryRepo.GetByID(ctx, in.ID)
	if err != nil {
		return nil, err
	}
	if cat.HouseholdID != in.HouseholdID {
		return nil, repository.ErrNotFound
	}

	if in.Name != nil {
		cat.Name = *in.Name
	}
	if in.Color != nil {
		cat.Color = *in.Color
	}
	if in.SortOrder != nil {
		cat.SortOrder = *in.SortOrder
	}
	if in.IsArchived != nil {
		cat.IsArchived = *in.IsArchived
	}

	if err := s.categoryRepo.Update(ctx, cat); err != nil {
		return nil, err
	}

	return cat, nil
}
