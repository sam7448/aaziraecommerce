import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

router.post('/create-order', authorizeRoles('customer'), paymentController.createOrder);
router.post('/verify', authorizeRoles('customer'), paymentController.verifyPayment);

export default router;
