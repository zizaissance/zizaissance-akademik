import { Router } from 'express';
import { MahasiswaController } from '../controllers/MahasiswaController';

const router = Router();

// Rute khusus harus sebelum rute dengan parameter (:nim)
router.get('/search',     MahasiswaController.search);
router.get('/sort',       MahasiswaController.sort);
router.get('/stats',      MahasiswaController.stats);
router.get('/export/csv', MahasiswaController.exportCSV);

// CRUD
router.get('/',     MahasiswaController.getAll);
router.get('/:nim', MahasiswaController.getOne);
router.post('/',    MahasiswaController.create);
router.put('/:nim', MahasiswaController.update);
router.delete('/:nim', MahasiswaController.delete);

export default router;