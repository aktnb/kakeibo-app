package response

import (
	"time"

	domaincategory "github.com/aktnb/kakeibo-app/apps/api/internal/domain/category"
)

type Category struct {
	ID         string  `json:"id"`
	Name       string  `json:"name"`
	Kind       string  `json:"kind"`
	Color      *string `json:"color,omitempty"`
	SortOrder  int     `json:"sortOrder"`
	IsArchived bool    `json:"isArchived"`
	CreatedAt  string  `json:"createdAt"`
	UpdatedAt  string  `json:"updatedAt"`
}

func NewCategory(cat domaincategory.Category) Category {
	return Category{
		ID:         cat.ID,
		Name:       cat.Name,
		Kind:       string(cat.Kind),
		Color:      cat.Color,
		SortOrder:  cat.SortOrder,
		IsArchived: cat.IsArchived,
		CreatedAt:  cat.CreatedAt.Format(time.RFC3339),
		UpdatedAt:  cat.UpdatedAt.Format(time.RFC3339),
	}
}

func NewCategories(categories []domaincategory.Category) []Category {
	items := make([]Category, 0, len(categories))
	for _, cat := range categories {
		items = append(items, NewCategory(cat))
	}
	return items
}
