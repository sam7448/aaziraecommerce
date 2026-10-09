import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Unauthorized: Missing token' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
      return;
    }

    let role = user.user_metadata?.role;
    if (!role || role === 'customer') {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (profile?.role) {
        role = profile.role;
      }
    }

    req.user = {
      id: user.id,
      email: user.email || '',
      role: (role as any) || 'customer',
    };

    next();
  } catch (error) {
    next(error);
  }
};
