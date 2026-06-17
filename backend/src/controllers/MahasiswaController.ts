// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import { MahasiswaService } from '../services/MahasiswaService';
import { FileIOService } from '../services/FileIOService';
import { linearSearch, binarySearch, sequentialSearch } from '../algorithms/search/index';
import { bubbleSort, selectionSort, insertionSort, mergeSort, shellSort } from '../algorithms/sort/index';

const qs = (val: unknown, def = ''): string =>
  Array.isArray(val) ? String(val[0]) : String(val ?? def);

export class MahasiswaController {

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MahasiswaService.getAll();
      res.json({ success: true, total: data.length, data });
    } catch (error) { next(error); }
  }

  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MahasiswaService.getByNIM(req.params.nim);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MahasiswaService.create(req.body);
      res.status(201).json({ success: true, message: 'Mahasiswa berhasil ditambahkan', data });
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MahasiswaService.update(req.params.nim, req.body);
      res.json({ success: true, message: 'Data berhasil diperbarui', data });
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await MahasiswaService.delete(req.params.nim);
      res.json({ success: true, message: 'Mahasiswa berhasil dihapus' });
    } catch (error) { next(error); }
  }

  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const keyword   = qs(req.query.q);
      const algorithm = qs(req.query.algorithm, 'linear');
      const field     = qs(req.query.field, 'nama');
      const data      = await MahasiswaService.getAll();

      let result;
      if (algorithm === 'binary') {
        const sorted = [...data].sort((a, b) => a.nim.localeCompare(b.nim));
        result = binarySearch(sorted, keyword);
      } else if (algorithm === 'sequential') {
        result = sequentialSearch(data, keyword);
      } else {
        result = linearSearch(data, keyword, field);
      }
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  static async sort(req: Request, res: Response, next: NextFunction) {
    try {
      const key       = qs(req.query.key, 'nama');
      const algorithm = qs(req.query.algorithm, 'bubble');
      const order     = qs(req.query.order, 'asc');
      const data      = await MahasiswaService.getAll();

      let result;
      if      (algorithm === 'selection') result = selectionSort(data, key, order);
      else if (algorithm === 'insertion') result = insertionSort(data, key, order);
      else if (algorithm === 'merge')     result = mergeSort(data, key, order);
      else if (algorithm === 'shell')     result = shellSort(data, key, order);
      else                                result = bubbleSort(data, key, order);

      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  static async stats(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MahasiswaService.getStats();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async exportCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MahasiswaService.getAll();
      const exportData = data.map(m => m as unknown as Record<string, unknown>);
      const csv = FileIOService.exportCSV(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=mahasiswa.csv');
      res.send(csv);
    } catch (error) { next(error); }
  }
}