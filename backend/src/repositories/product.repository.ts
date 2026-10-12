import { supabaseAdmin } from '../config/supabase';
import { Product, ProductFilterQuery, CreateProductDTO, UpdateProductDTO } from '../types/product.types';

export class ProductRepository {
  async findAll(filter: ProductFilterQuery): Promise<{ products: Product[]; total: number }> {
    const page = filter.page || 1;
    const limit = filter.limit || 12;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from('products')
      .select('*, product_images(*), inventory(*)', { count: 'exact' });

    if (filter.status && filter.status !== 'all') {
      query = query.eq('status', filter.status);
    } else if (!filter.status && !filter.sellerId) {
      query = query.eq('status', 'active');
    }

    if (filter.categoryId) {
      query = query.eq('category_id', filter.categoryId);
    }

    if (filter.sellerId) {
      query = query.eq('seller_id', filter.sellerId);
    }

    if (filter.minPrice !== undefined) {
      query = query.gte('price', filter.minPrice);
    }

    if (filter.maxPrice !== undefined) {
      query = query.lte('price', filter.maxPrice);
    }

    if (filter.search) {
      query = query.ilike('name', `%${filter.search}%`);
    }

    switch (filter.sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    return {
      products: (data || []).map(this.mapToEntity),
      total: count || 0,
    };
  }

  async findById(id: string): Promise<Product | null> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*, product_images(*), inventory(*)')
      .eq('id', id)
      .single();

    if (error) return null;
    return this.mapToEntity(data);
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*, product_images(*), inventory(*)')
      .eq('slug', slug)
      .single();

    if (error) return null;
    return this.mapToEntity(data);
  }

  async create(sellerId: string, dto: CreateProductDTO): Promise<Product> {
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString().slice(-4) + randomSuffix;

    const cleanedSku = (dto.sku || '').trim() || ('SKU-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase());
    const cleanedCategoryId = (dto.categoryId && typeof dto.categoryId === 'string' && dto.categoryId.trim() !== '') ? dto.categoryId.trim() : null;

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .insert({
        seller_id: sellerId,
        category_id: cleanedCategoryId,
        name: dto.name.trim(),
        slug,
        sku: cleanedSku,
        description: dto.description ? dto.description.trim() : null,
        price: Number(dto.price),
        discount_price: (dto.discountPrice !== undefined && dto.discountPrice !== null && Number(dto.discountPrice) > 0) ? Number(dto.discountPrice) : null,
        status: dto.status || 'active',
      })
      .select()
      .single();

    if (error) {
      if (error.message.includes('unique') || error.code === '23505') {
        if (error.message.includes('sku')) {
          throw new Error(`A product with SKU "${dto.sku}" already exists. Please use a unique SKU.`);
        }
      }
      throw error;
    }

    const initialQuantity = dto.initialStock !== undefined ? dto.initialStock : 0;

    // Create inventory record
    const { error: invError } = await supabaseAdmin.from('inventory').insert({
      product_id: product.id,
      quantity: initialQuantity,
      reserved_quantity: 0,
      low_stock_threshold: 5,
    });
    if (invError) {
      console.warn('Inventory record warning:', invError.message);
    }

    // Create initial inbound movement for auditing
    if (initialQuantity > 0) {
      await supabaseAdmin.from('inventory_movements').insert({
        product_id: product.id,
        created_by: sellerId,
        type: 'inbound',
        quantity_change: initialQuantity,
        notes: 'Initial stock received on listing creation',
      });
    }

    // Create initial images if provided
    if (dto.images && dto.images.length > 0) {
      const validImages = dto.images
        .filter((img) => img.storagePath && img.storagePath.trim() !== '')
        .map((img, idx) => ({
          product_id: product.id,
          storage_path: img.storagePath.trim(),
          is_primary: img.isPrimary !== undefined ? img.isPrimary : idx === 0,
          sort_order: img.sortOrder !== undefined ? img.sortOrder : idx,
        }));

      if (validImages.length > 0) {
        const { error: imgError } = await supabaseAdmin.from('product_images').insert(validImages);
        if (imgError) {
          console.warn('Product image insert warning:', imgError.message);
        }
      }
    }

    const created = await this.findById(product.id);
    return created || this.mapToEntity(product);
  }

  async update(id: string, dto: UpdateProductDTO): Promise<Product> {
    const updates: any = {};
    if (dto.name !== undefined) updates.name = dto.name;
    if (dto.categoryId !== undefined) updates.category_id = dto.categoryId;
    if (dto.sku !== undefined) updates.sku = dto.sku;
    if (dto.description !== undefined) updates.description = dto.description;
    if (dto.price !== undefined) updates.price = dto.price;
    if (dto.discountPrice !== undefined) updates.discount_price = dto.discountPrice;
    if (dto.status !== undefined) updates.status = dto.status;
    updates.updated_at = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return (await this.findById(id))!;
  }

  async updateInventory(productId: string, quantity: number, movementType: string, createdBy?: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('inventory')
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq('product_id', productId);

    if (error) throw error;

    await supabaseAdmin.from('inventory_movements').insert({
      product_id: productId,
      created_by: createdBy || null,
      type: movementType,
      quantity_change: quantity,
    });
  }

  private mapToEntity(row: any): Product {
    return {
      id: row.id,
      sellerId: row.seller_id,
      categoryId: row.category_id,
      name: row.name,
      slug: row.slug,
      sku: row.sku,
      description: row.description,
      price: Number(row.price),
      discountPrice: row.discount_price ? Number(row.discount_price) : null,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      images: (row.product_images || []).map((img: any) => ({
        id: img.id,
        productId: img.product_id,
        storagePath: img.storage_path,
        sortOrder: img.sort_order,
        isPrimary: img.is_primary,
        createdAt: img.created_at,
      })),
      inventory: row.inventory
        ? {
            quantity: row.inventory.quantity,
            reservedQuantity: row.inventory.reserved_quantity,
            lowStockThreshold: row.inventory.low_stock_threshold,
          }
        : undefined,
    };
  }
}

export const productRepository = new ProductRepository();
