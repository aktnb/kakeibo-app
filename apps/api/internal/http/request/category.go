package request

type CreateCategoryRequest struct {
	Name      string  `json:"name"`
	Kind      string  `json:"kind"`
	Color     *string `json:"color"`
	SortOrder int     `json:"sortOrder"`
}

type UpdateCategoryRequest struct {
	Name       *string `json:"name"`
	Color      *string `json:"color"`
	SortOrder  *int    `json:"sortOrder"`
	IsArchived *bool   `json:"isArchived"`
}
