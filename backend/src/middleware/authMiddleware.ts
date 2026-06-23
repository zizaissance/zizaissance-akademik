// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

// Middleware penjaga route yang butuh login. Cek header Authorization,
// ekstrak token-nya, verifikasi lewat AuthService, terus tempel info
// user ke req supaya handler berikutnya bisa akses tanpa decode ulang.
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
    // verifyToken throw kalau token invalid atau expired, tangkap di sini
    // supaya error-nya gak sampai ke global error handler tapi balik 401
    res.status(401).json({ success: false, message: 'Token tidak valid atau kadaluarsa' });
  }
}