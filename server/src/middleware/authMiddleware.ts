import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : undefined);

  if (!token) {
    res.status(401).json({ success: false, message: 'Unauthorized — no token provided' });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      preAuth?: boolean;
    };
    if (payload.preAuth) {
      res.status(401).json({ success: false, message: 'MFA verification required' });
      return;
    }
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
