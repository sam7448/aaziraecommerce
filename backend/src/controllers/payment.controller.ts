import { Request, Response } from 'express';
import { paymentService } from '../services/payment.service';
import { asyncHandler } from '../utils/async-handler';

export class PaymentController {
  createOrder = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.user!.id;
    const result = await paymentService.createRazorpayOrder(customerId);
    res.status(200).json({ success: true, data: result });
  });

  verifyPayment = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.user!.id;
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, shippingAddress } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !shippingAddress) {
      res.status(400).json({
        success: false,
        message: 'Missing required payment verification parameters or shipping address',
      });
      return;
    }

    const order = await paymentService.verifyPaymentAndCreateOrder(customerId, {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      shippingAddress,
    });

    res.status(201).json({ success: true, data: order });
  });
}

export const paymentController = new PaymentController();
