import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();

// Public routes for product catalog discovery
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.get('/slug/:slug', productController.getProductBySlug);

// Seller & Admin management
router.post('/', authenticate, authorizeRoles('seller', 'admin'), productController.createProduct);
router.put('/:id', authenticate, authorizeRoles('seller', 'admin'), productController.updateProduct);
router.patch('/:id/inventory', authenticate, authorizeRoles('seller', 'admin'), productController.updateInventory);

export default router;
