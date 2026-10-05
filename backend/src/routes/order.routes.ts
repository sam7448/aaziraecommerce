import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

// Customer checkout and my orders
router.post('/checkout', authorizeRoles('customer'), orderController.checkout);
router.get('/my-orders', authorizeRoles('customer'), orderController.getMyOrders);

// Seller orders
router.get('/seller-orders', authorizeRoles('seller', 'admin'), orderController.getSellerOrders);

// Admin all orders
router.get('/all', authorizeRoles('admin'), orderController.getAllOrders);

// Order by ID
router.get('/:id', orderController.getOrderById);

// Update status (seller & admin)
router.patch('/:id/status', authorizeRoles('seller', 'admin'), orderController.updateOrderStatus);

export default router;
