// @ts-nocheck
import { Router }      from 'express';
import { AuthService } from '../services/AuthService';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ success: false, message: 'Username dan password wajib diisi' });
    const result = await AuthService.login(username, password);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(401).json({ success: false, message: (error as Error).message });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email wajib diisi' });
    await AuthService.forgotPassword(email);
    res.json({ success: true, message: 'Link reset password telah dikirim ke email kamu' });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ success: false, message: 'Token dan password baru wajib diisi' });
    await AuthService.resetPassword(token, newPassword);
    res.json({ success: true, message: 'Password berhasil direset! Silakan login.' });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { nama, email, password, role } = req.body;
    if (!nama || !email || !password || !role)
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
    if (!['admin', 'user'].includes(role))
      return res.status(400).json({ success: false, message: 'Role tidak valid' });
    await AuthService.register(nama, email, password, role);
    res.json({ success: true, message: 'Kode OTP telah dikirim ke email kamu' });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
});

router.post('/verify-register', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ success: false, message: 'Email dan OTP wajib diisi' });
    const result = await AuthService.verifyRegisterOTP(email, otp);
    res.json({ success: true, message: 'Akun berhasil dibuat!', ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
});

export default router;