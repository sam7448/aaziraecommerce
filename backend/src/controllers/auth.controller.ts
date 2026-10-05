import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { asyncHandler } from '../utils/async-handler';

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    res.status(200).json({ success: true, data: result });
  });

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const profile = await authService.getProfile(userId!);
    res.status(200).json({ success: true, data: profile });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    await authService.logout(req.headers.authorization);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  });
}

export const authController = new AuthController();
