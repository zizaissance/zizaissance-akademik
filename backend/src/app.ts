// @ts-nocheck
import express from 'express';
import cors    from 'cors';
import dotenv  from 'dotenv';
dotenv.config();

import { FileIOService } from './services/FileIOService';
import { AuthService   } from './services/AuthService';
import { AppException  } from './exceptions';
import { requireAuth   } from './middleware/authMiddleware';
import mahasiswaRoutes   from './routes/mahasiswa.routes';
import authRoutes        from './routes/auth.routes';

const app  = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.use('/api/v1/auth',       authRoutes);
app.use('/api/v1/mahasiswa',  requireAuth, mahasiswaRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API Manajemen Mahasiswa berjalan!', version: '1.0.0' });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof AppException) {
    res.status(err.statusCode).json({ success: false, error: err.name, message: err.message });
  } else {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
});

async function main() {
  await FileIOService.init();
  await AuthService.init();
  app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
}

main().catch(console.error);
export default app;