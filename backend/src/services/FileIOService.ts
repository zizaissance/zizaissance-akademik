import fs   from 'fs/promises';
import path from 'path';
import { FileIOError } from '../exceptions';

// Path file penyimpanan data
const DATA_DIR  = path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'mahasiswa.json');

/**
 * @class FileIOService
 * @description Mengelola operasi baca dan tulis data ke file JSON.
 * Semua method static — tidak perlu instansiasi.
 * @complexity Read: O(n) | Write: O(n) — n = jumlah record
 */
export class FileIOService {

  /**
   * @method init
   * @description Pastikan folder dan file data sudah ada.
   * Dipanggil sekali saat server start.
   */
  static async init(): Promise<void> {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      try {
        await fs.access(DATA_FILE);
      } catch {
        // File belum ada, buat file kosong
        await fs.writeFile(DATA_FILE, '[]', 'utf-8');
      }
    } catch (error) {
      throw new FileIOError('tulis', (error as Error).message);
    }
  }

  /**
   * @method readAll
   * @description Baca semua data mahasiswa dari file JSON.
   * @returns Array of plain objects dari file
   * @throws FileIOError jika file tidak bisa dibaca
   * @complexity Time: O(n) | Space: O(n)
   */
  static async readAll(): Promise<object[]> {
    try {
      const raw = await fs.readFile(DATA_FILE, 'utf-8');
      return JSON.parse(raw) as object[];
    } catch (error) {
      throw new FileIOError('baca', (error as Error).message);
    }
  }

  /**
   * @method writeAll
   * @description Tulis semua data mahasiswa ke file JSON (overwrite).
   * @param data Array of plain objects yang akan disimpan
   * @throws FileIOError jika file tidak bisa ditulis
   * @complexity Time: O(n) | Space: O(n)
   */
  static async writeAll(data: object[]): Promise<void> {
    try {
      const json = JSON.stringify(data, null, 2);
      await fs.writeFile(DATA_FILE, json, 'utf-8');
    } catch (error) {
      throw new FileIOError('tulis', (error as Error).message);
    }
  }

  /**
   * @method exportCSV
   * @description Export semua data mahasiswa ke format CSV string.
   * @param data Array of plain objects
   * @returns String CSV siap download
   * @complexity Time: O(n) | Space: O(n)
   */
  static exportCSV(data: Record<string, unknown>[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
      headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  }
}