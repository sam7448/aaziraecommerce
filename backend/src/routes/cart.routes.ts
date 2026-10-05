import { Router } from 'express';
import { cartController } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Cart routes
router.get('/', cartController.getCart);
router.post('/items', cartController.addToCart);
router.put('/items/:itemId', cartController.updateQuantity);
router.delete('/items/:itemId', cartController.removeItem);
router.delete('/', cartController.clearCart);

// Wishlist routes
router.get('/wishlist', cartController.getWishlist);
router.post('/wishlist', cartController.addToWishlist);
router.delete('/wishlist/:productId', cartController.removeFromWishlist);

export default router;
