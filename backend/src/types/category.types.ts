export interface Category {
  id: string;
  parentId?: string | null;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCategoryDTO {
  parentId?: string | null;
  name: string;
  slug?: string;
  isActive?: boolean;
}

export interface UpdateCategoryDTO {
  parentId?: string | null;
  name?: string;
  slug?: string;
  isActive?: boolean;
}
