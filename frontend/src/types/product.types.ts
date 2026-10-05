export interface ProductImage {
  id: string;
  productId: string;
  storagePath: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface Inventory {
  quantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
}

export interface Product {
  id: string;
  sellerId: string;
  categoryId?: string | null;
  name: string;
  slug: string;
  sku: string;
  description?: string | null;
  price: number;
  discountPrice?: number | null;
  status: 'draft' | 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
  images?: ProductImage[];
  inventory?: Inventory;
}

export interface CreateProductDTO {
  name: string;
  sku: string;
  categoryId?: string;
  price: number;
  discountPrice?: number;
  status?: 'draft' | 'active' | 'inactive' | 'archived';
  initialStock?: number;
  description?: string;
  images?: { storagePath: string; isPrimary?: boolean; sortOrder?: number }[];
}

export interface Category {
  id: string;
  parentId?: string | null;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface ProductFilterQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
}
