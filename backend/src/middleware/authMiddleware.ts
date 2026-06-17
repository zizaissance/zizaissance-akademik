// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
    }
    const token   = header.split(' ')[1];
    const decoded = AuthService.verifyToken(token);
    (req as any).user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token tidak valid atau kadaluarsa' });
  }
}