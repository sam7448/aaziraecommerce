import { supabaseAdmin } from '../config/supabase';
import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '../types/category.types';

export class CategoryRepository {
  async findAll(onlyActive: boolean = true): Promise<Category[]> {
    let query = supabaseAdmin.from('categories').select('*').order('name');
    if (onlyActive) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(this.mapToEntity);
  }

  async findById(id: string): Promise<Category | null> {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return this.mapToEntity(data);
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) return null;
    return this.mapToEntity(data);
  }

  async create(dto: CreateCategoryDTO): Promise<Category> {
    const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({
        parent_id: dto.parentId || null,
        name: dto.name,
        slug,
        is_active: dto.isActive !== undefined ? dto.isActive : true,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapToEntity(data);
  }

  async update(id: string, dto: UpdateCategoryDTO): Promise<Category> {
    const updates: any = {};
    if (dto.name !== undefined) updates.name = dto.name;
    if (dto.slug !== undefined) updates.slug = dto.slug;
    if (dto.parentId !== undefined) updates.parent_id = dto.parentId;
    if (dto.isActive !== undefined) updates.is_active = dto.isActive;

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToEntity(data);
  }

  private mapToEntity(row: any): Category {
    return {
      id: row.id,
      parentId: row.parent_id,
      name: row.name,
      slug: row.slug,
      isActive: row.is_active,
      createdAt: row.created_at,
    };
  }
}

export const categoryRepository = new CategoryRepository();
