import { Request, Response } from 'express';
import { userRepository } from '../repositories/user.repository';
import { orderRepository } from '../repositories/order.repository';
import { productRepository } from '../repositories/product.repository';
import { asyncHandler } from '../utils/async-handler';

export class AdminController {
  getMetrics = asyncHandler(async (_req: Request, res: Response) => {
    const users = await userRepository.findAll();
    const orders = await orderRepository.findAll();
    const { total: totalProducts } = await productRepository.findAll({ limit: 1 });

    const totalRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    const customersCount = users.filter((u) => u.role === 'customer').length;
    const sellersCount = users.filter((u) => u.role === 'seller').length;

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalOrders: orders.length,
        totalProducts,
        customersCount,
        sellersCount,
      },
    });
  });

  getUsers = asyncHandler(async (_req: Request, res: Response) => {
    const users = await userRepository.findAll();
    res.status(200).json({ success: true, data: users });
  });

  updateSellerApproval = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { status } = req.body;
    await userRepository.updateSellerStatus(userId, status);
    res.status(200).json({ success: true, message: `Seller status updated to ${status}` });
  });
}

export const adminController = new AdminController();
