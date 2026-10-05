import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

// Admin-only management
router.post('/', authenticate, authorizeRoles('admin'), categoryController.createCategory);
router.put('/:id', authenticate, authorizeRoles('admin'), categoryController.updateCategory);

export default router;
