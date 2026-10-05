import { Request, Response } from 'express';
import { cartService } from '../services/cart.service';
import { asyncHandler } from '../utils/async-handler';

export class CartController {
  getCart = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const cart = await cartService.getCart(userId);
    res.status(200).json({ success: true, data: cart });
  });

  addToCart = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const cart = await cartService.addToCart(userId, req.body);
    res.status(200).json({ success: true, data: cart });
  });

  updateQuantity = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { itemId } = req.params;
    const { quantity } = req.body;
    const cart = await cartService.updateQuantity(userId, itemId, Number(quantity));
    res.status(200).json({ success: true, data: cart });
  });

  removeItem = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { itemId } = req.params;
    const cart = await cartService.removeItem(userId, itemId);
    res.status(200).json({ success: true, data: cart });
  });

  clearCart = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    await cartService.clearCart(userId);
    res.status(200).json({ success: true, message: 'Cart cleared' });
  });

  // Wishlist
  getWishlist = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const wishlist = await cartService.getWishlist(userId);
    res.status(200).json({ success: true, data: wishlist });
  });

  addToWishlist = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { productId } = req.body;
    await cartService.addToWishlist(userId, productId);
    res.status(200).json({ success: true, message: 'Added to wishlist' });
  });

  removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { productId } = req.params;
    await cartService.removeFromWishlist(userId, productId);
    res.status(200).json({ success: true, message: 'Removed from wishlist' });
  });
}

export const cartController = new CartController();
