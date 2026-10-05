import { api } from './api';
import { Product, ProductFilterQuery, Category, CreateProductDTO } from '../types/product.types';

export const productService = {
  async getProducts(params?: ProductFilterQuery): Promise<{ products: Product[]; total: number }> {
    const res = await api.get('/products', { params });
    return res.data;
  },

  async getProductById(id: string): Promise<Product> {
    const res = await api.get<{ data: Product }>(`/products/${id}`);
    return res.data.data;
  },

  async getProductBySlug(slug: string): Promise<Product> {
    const res = await api.get<{ data: Product }>(`/products/slug/${slug}`);
    return res.data.data;
  },

  async getCategories(): Promise<Category[]> {
    const res = await api.get<{ data: Category[] }>('/categories');
    return res.data.data;
  },

  async createProduct(productData: CreateProductDTO): Promise<Product> {
    const res = await api.post<{ data: Product }>('/products', productData);
    return res.data.data;
  },

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    const res = await api.put<{ data: Product }>(`/products/${id}`, productData);
    return res.data.data;
  },

  async updateInventory(id: string, quantity: number): Promise<void> {
    await api.patch(`/products/${id}/inventory`, { quantity });
  },
};
