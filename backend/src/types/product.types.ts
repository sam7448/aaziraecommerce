export type ProductStatus = 'draft' | 'active' | 'inactive' | 'archived';

export interface ProductImage {
  id: string;
  productId: string;
  storagePath: string;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
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
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  images?: ProductImage[];
  inventory?: {
    quantity: number;
    reservedQuantity: number;
    lowStockThreshold: number;
  };
}

export interface ProductFilterQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  sellerId?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
}

export interface CreateProductDTO {
  categoryId?: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  discountPrice?: number;
  status?: ProductStatus;
  initialStock?: number;
  images?: { storagePath: string; isPrimary?: boolean; sortOrder?: number }[];
}

export interface UpdateProductDTO {
  categoryId?: string;
  name?: string;
  sku?: string;
  description?: string;
  price?: number;
  discountPrice?: number;
  status?: ProductStatus;
}
