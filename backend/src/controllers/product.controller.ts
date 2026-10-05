import { Request, Response } from 'express';
import { productService } from '../services/product.service';
import { asyncHandler } from '../utils/async-handler';

export class ProductController {
  getProducts = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, search, categoryId, sellerId, minPrice, maxPrice, sortBy, status } = req.query;

    const result = await productService.getProducts({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 12,
      search: search as string,
      categoryId: categoryId as string,
      sellerId: sellerId as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy: sortBy as any,
      status: status as any,
    });

    res.status(200).json({ success: true, ...result });
  });

  getProductById = asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json({ success: true, data: product });
  });

  getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.getProductBySlug(req.params.slug);
    res.status(200).json({ success: true, data: product });
  });

  createProduct = asyncHandler(async (req: Request, res: Response) => {
    const sellerId = req.user!.id;
    const product = await productService.createProduct(sellerId, req.body);
    res.status(201).json({ success: true, data: product });
  });

  updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const sellerId = req.user!.id;
    const isAdmin = req.user!.role === 'admin';
    const product = await productService.updateProduct(sellerId, req.params.id, req.body, isAdmin);
    res.status(200).json({ success: true, data: product });
  });

  updateInventory = asyncHandler(async (req: Request, res: Response) => {
    const sellerId = req.user!.id;
    const isAdmin = req.user!.role === 'admin';
    const { quantity } = req.body;
    await productService.updateInventory(sellerId, req.params.id, quantity, isAdmin);
    res.status(200).json({ success: true, message: 'Inventory updated successfully' });
  });
}

export const productController = new ProductController();
