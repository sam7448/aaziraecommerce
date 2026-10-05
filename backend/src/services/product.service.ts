import { productRepository } from '../repositories/product.repository';
import { Product, ProductFilterQuery, CreateProductDTO, UpdateProductDTO } from '../types/product.types';

export class ProductService {
  async getProducts(query: ProductFilterQuery): Promise<{ products: Product[]; total: number }> {
    return productRepository.findAll(query);
  }

  async getProductById(id: string): Promise<Product> {
    const product = await productRepository.findById(id);
    if (!product) throw new Error('Product not found');
    return product;
  }

  async getProductBySlug(slug: string): Promise<Product> {
    const product = await productRepository.findBySlug(slug);
    if (!product) throw new Error('Product not found');
    return product;
  }

  async createProduct(sellerId: string, dto: CreateProductDTO): Promise<Product> {
    return productRepository.create(sellerId, dto);
  }

  async updateProduct(sellerId: string, productId: string, dto: UpdateProductDTO, isAdmin: boolean = false): Promise<Product> {
    const existing = await productRepository.findById(productId);
    if (!existing) throw new Error('Product not found');

    if (!isAdmin && existing.sellerId !== sellerId) {
      throw new Error('Forbidden: You can only edit your own products');
    }

    return productRepository.update(productId, dto);
  }

  async updateInventory(sellerId: string, productId: string, quantity: number, isAdmin: boolean = false): Promise<void> {
    const existing = await productRepository.findById(productId);
    if (!existing) throw new Error('Product not found');

    if (!isAdmin && existing.sellerId !== sellerId) {
      throw new Error('Forbidden: You can only update inventory for your own products');
    }

    if (quantity < 0) {
      throw new Error('Inventory cannot be negative');
    }

    await productRepository.updateInventory(productId, quantity, 'adjustment', sellerId);
  }
}

export const productService = new ProductService();
