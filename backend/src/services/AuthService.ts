import jwt        from 'jsonwebtoken';
import bcrypt     from 'bcryptjs';
import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import fs         from 'fs/promises';
import path       from 'path';
import crypto     from 'crypto';

const USERS_FILE   = path.join(__dirname, '../../data/users.json');
const TOKENS_FILE  = path.join(__dirname, '../../data/reset-tokens.json');
const REG_OTP_FILE = path.join(__dirname, '../../data/register-otps.json');

export interface User {
  id:        string;
  username:  string;
  email:     string;
  password:  string;
  role:      'admin' | 'user';
  createdAt: string;
}

export interface ResetToken {
  token:     string;
  email:     string;
  expiresAt: number;
}

export interface RegisterOTP {
  email:     string;
  nama:      string;
  password:  string;
  role:      'admin' | 'user';
  otp:       string;
  expiresAt: number;
}

// ── File helpers ──────────────────────────────────────────

async function readUsers(): Promise<User[]> {
  try {
    const raw = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch { return []; }
}

async function writeUsers(users: User[]): Promise<void> {
  await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

async function readTokens(): Promise<ResetToken[]> {
  try {
    const raw = await fs.readFile(TOKENS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch { return []; }
}

async function writeTokens(tokens: ResetToken[]): Promise<void> {
  await fs.writeFile(TOKENS_FILE, JSON.stringify(tokens, null, 2));
}

async function readRegOtps(): Promise<RegisterOTP[]> {
  try {
    const raw = await fs.readFile(REG_OTP_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch { return []; }
}

async function writeRegOtps(otps: RegisterOTP[]): Promise<void> {
  await fs.mkdir(path.dirname(REG_OTP_FILE), { recursive: true });
  await fs.writeFile(REG_OTP_FILE, JSON.stringify(otps, null, 2));
}

// ── Nodemailer transporter ─────────────────────────────────

function createTransporter() {
  const options = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Railway tidak mendukung outbound IPv6, sementara Gmail SMTP kadang
    // mengembalikan alamat IPv6 lewat DNS — opsi ini memaksa koneksi
    // selalu memakai IPv4 supaya tidak gagal dengan error ENETUNREACH.
    // Opsi 'family' didukung Node.js secara runtime tapi belum ada di
    // type definition @types/nodemailer, sehingga perlu "as any".
    family: 4,
  } as SMTPTransport.Options & { family: number };
  return nodemailer.createTransport(options);
}

// ── Auth Service ───────────────────────────────────────────

export class AuthService {

  /** Inisialisasi: buat admin default jika belum ada */
  static async init(): Promise<void> {
    const users = await readUsers();
    if (users.length === 0) {
      const hashed = await bcrypt.hash('admin123', 10);
      await writeUsers([{
        id:        crypto.randomUUID(),
        username:  'admin',
        email:     process.env.EMAIL_USER ?? 'admin@admin.com',
        password:  hashed,
        role:      'admin',
        createdAt: new Date().toISOString(),
      }]);
      console.log('Default admin dibuat: username=admin, password=admin123');
    }
  }

  /** Login — kembalikan JWT token */
  static async login(username: string, password: string): Promise<{ token: string; user: Omit<User, 'password'> }> {
    const users = await readUsers();
    const user  = users.find(u => u.username === username || u.email === username);

    if (!user) throw new Error('Username atau password salah');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Username atau password salah');

    const { password: _, ...userWithoutPassword } = user;
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET ?? 'secret',
      { expiresIn: '24h' } as any
    );

    return { token, user: userWithoutPassword };
  }

  /** Verify JWT token */
  static verifyToken(token: string): any {
    return jwt.verify(token, process.env.JWT_SECRET ?? 'secret');
  }

  /** Forgot password — kirim email reset */
  static async forgotPassword(email: string): Promise<void> {
    const users = await readUsers();
    const user  = users.find(u => u.email === email);

    if (!user) throw new Error('Email tidak terdaftar');

    const token     = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (parseInt(process.env.RESET_TOKEN_EXPIRES ?? '15') * 60 * 1000);

    const tokens   = await readTokens();
    const filtered = tokens.filter(t => t.email !== email);
    await writeTokens([...filtered, { token, email, expiresAt }]);

    const resetUrl    = `http://localhost:5173/reset-password?token=${token}`;
    const transporter = createTransporter();

    await transporter.sendMail({
      from:    process.env.EMAIL_FROM,
      to:      email,
      subject: '🌸 Reset Password — Sistem Akademik',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#fffaf9;border-radius:16px;padding:32px;border:1px solid #ecc4c3;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="font-size:32px">🌸</div>
            <h2 style="color:#6b3a3a;margin:8px 0 4px">Reset Password</h2>
            <p style="color:#b97d7b;font-size:13px;margin:0">Sistem Manajemen Data Mahasiswa</p>
          </div>
          <p style="color:#575527;font-size:14px;line-height:1.6">
            Halo <strong>${user.username}</strong>, kami menerima permintaan reset password untuk akun kamu.
          </p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${resetUrl}" style="display:inline-block;background:#b97d7b;color:#fff7f7;padding:12px 28px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:500;">
              Reset Password Sekarang
            </a>
          </div>
          <p style="color:#928e5e;font-size:12px;text-align:center;line-height:1.6">
            Link ini berlaku selama <strong>${process.env.RESET_TOKEN_EXPIRES} menit</strong>.<br>
            Jika kamu tidak meminta reset password, abaikan email ini.
          </p>
          <hr style="border:none;border-top:1px solid #ecc4c3;margin:20px 0">
          <p style="color:#b97d7b;font-size:11px;text-align:center;margin:0">© 2026 Zizaissance's Sistem Akademik</p>
        </div>
      `,
    });
  }

  /** Reset password dengan token */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokens = await readTokens();
    const record = tokens.find(t => t.token === token);

    if (!record)                       throw new Error('Token tidak valid');
    if (Date.now() > record.expiresAt) throw new Error('Token sudah kadaluarsa');

    const users = await readUsers();
    const idx   = users.findIndex(u => u.email === record.email);
    if (idx === -1) throw new Error('User tidak ditemukan');

    users[idx].password = await bcrypt.hash(newPassword, 10);
    await writeUsers(users);

    await writeTokens(tokens.filter(t => t.token !== token));
  }

  /** Register — validasi, simpan OTP sementara, kirim email */
  static async register(
    nama: string,
    email: string,
    password: string,
    role: 'admin' | 'user'
  ): Promise<void> {
    const users = await readUsers();

    if (users.find(u => u.email === email)) {
      throw new Error('Email sudah terdaftar');
    }

    const otp       = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    const otps     = await readRegOtps();
    const filtered = otps.filter(o => o.email !== email);
    await writeRegOtps([...filtered, {
      email, nama, password: await bcrypt.hash(password, 10),
      role, otp, expiresAt,
    }]);

    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from:    process.env.EMAIL_FROM,
        to:      email,
        subject: '🌸 Kode Verifikasi Pendaftaran — Sistem Akademik',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#fffaf9;border-radius:16px;padding:32px;border:1px solid #ecc4c3;">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="font-size:32px">🌸</div>
              <h2 style="color:#6b3a3a;margin:8px 0 4px">Verifikasi Pendaftaran</h2>
              <p style="color:#b97d7b;font-size:13px;margin:0">Sistem Manajemen Data Mahasiswa</p>
            </div>
            <p style="color:#575527;font-size:14px;line-height:1.6">
              Halo <strong>${nama}</strong>, berikut kode OTP untuk verifikasi akun kamu:
            </p>
            <div style="text-align:center;margin:24px 0;">
              <div style="display:inline-block;background:linear-gradient(135deg,#c4637a,#a04560);color:#fff;font-size:32px;font-weight:700;letter-spacing:10px;padding:16px 28px;border-radius:14px;">
                ${otp}
              </div>
            </div>
            <p style="color:#928e5e;font-size:12px;text-align:center;line-height:1.6">
              Kode ini berlaku selama <strong>10 menit</strong>.<br>
              Jika kamu tidak mendaftar, abaikan email ini.
            </p>
            <hr style="border:none;border-top:1px solid #ecc4c3;margin:20px 0">
            <p style="color:#b97d7b;font-size:11px;text-align:center;margin:0">© 2026 Zizaissance's Sistem Akademik</p>
          </div>
        `,
      });
      console.log(`✅ Email OTP terkirim ke ${email}`);
    } catch (emailError) {
      // Email gagal tapi OTP sudah tersimpan — log saja, jangan crash
      console.error(`❌ Gagal kirim email:`, emailError);
      console.log(`🌸 OTP untuk ${email}: ${otp}`);
    }
  }

  /** Verify OTP registrasi — buat akun permanen */
  static async verifyRegisterOTP(email: string, otp: string): Promise<{ token: string; user: Omit<User, 'password'> }> {
    const otps   = await readRegOtps();
    const record = otps.find(o => o.email === email);

    if (!record)                       throw new Error('Data pendaftaran tidak ditemukan');
    if (record.otp !== otp)            throw new Error('Kode OTP tidak valid');
    if (Date.now() > record.expiresAt) throw new Error('Kode OTP sudah kadaluarsa');

    const newUser: User = {
      id:        crypto.randomUUID(),
      username:  email.split('@')[0],
      email:     record.email,
      password:  record.password,
      role:      record.role,
      createdAt: new Date().toISOString(),
    };

    const users = await readUsers();
    await writeUsers([...users, newUser]);
    await writeRegOtps(otps.filter(o => o.email !== email));

    const { password: _, ...userWithoutPassword } = newUser;
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      process.env.JWT_SECRET ?? 'secret',
      { expiresIn: '24h' } as any
    );

    return { token, user: userWithoutPassword };
  }
}