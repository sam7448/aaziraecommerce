import { Request, Response } from 'express';
import { orderService } from '../services/order.service';
import { asyncHandler } from '../utils/async-handler';

export class OrderController {
  checkout = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.user!.id;
    const order = await orderService.checkout(customerId, req.body);
    res.status(201).json({ success: true, data: order });
  });

  getMyOrders = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.user!.id;
    const orders = await orderService.getCustomerOrders(customerId);
    res.status(200).json({ success: true, data: orders });
  });

  getSellerOrders = asyncHandler(async (req: Request, res: Response) => {
    const sellerId = req.user!.id;
    const orders = await orderService.getSellerOrders(sellerId);
    res.status(200).json({ success: true, data: orders });
  });

  getAllOrders = asyncHandler(async (_req: Request, res: Response) => {
    const orders = await orderService.getAllOrders();
    res.status(200).json({ success: true, data: orders });
  });

  getOrderById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const role = req.user!.role;
    const order = await orderService.getOrderById(req.params.id, userId, role);
    res.status(200).json({ success: true, data: order });
  });

  updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status);
    res.status(200).json({ success: true, data: order });
  });
}

export const orderController = new OrderController();
