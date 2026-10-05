import { Request, Response } from 'express';
import { categoryService } from '../services/category.service';
import { asyncHandler } from '../utils/async-handler';

export class CategoryController {
  getCategories = asyncHandler(async (req: Request, res: Response) => {
    const onlyActive = req.query.all !== 'true';
    const categories = await categoryService.getCategories(onlyActive);
    res.status(200).json({ success: true, data: categories });
  });

  getCategoryById = asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.getCategoryById(req.params.id);
    res.status(200).json({ success: true, data: category });
  });

  createCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({ success: true, data: category });
  });

  updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    res.status(200).json({ success: true, data: category });
  });
}

export const categoryController = new CategoryController();
