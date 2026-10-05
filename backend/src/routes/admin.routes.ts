import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate, authorizeRoles('admin'));

router.get('/metrics', adminController.getMetrics);
router.get('/users', adminController.getUsers);
router.patch('/sellers/:userId/status', adminController.updateSellerApproval);

export default router;
