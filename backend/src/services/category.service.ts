import { categoryRepository } from '../repositories/category.repository';
import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '../types/category.types';

export class CategoryService {
  async getCategories(onlyActive: boolean = true): Promise<Category[]> {
    return categoryRepository.findAll(onlyActive);
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await categoryRepository.findById(id);
    if (!category) throw new Error('Category not found');
    return category;
  }

  async createCategory(dto: CreateCategoryDTO): Promise<Category> {
    return categoryRepository.create(dto);
  }

  async updateCategory(id: string, dto: UpdateCategoryDTO): Promise<Category> {
    return categoryRepository.update(id, dto);
  }
}

export const categoryService = new CategoryService();
