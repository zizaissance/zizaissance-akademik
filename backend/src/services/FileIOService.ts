import fs   from 'fs/promises';
import path from 'path';
import { FileIOError } from '../exceptions';

// Path file penyimpanan data
const DATA_DIR  = path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'mahasiswa.json');

// Service buat baca/tulis data mahasiswa ke file JSON. Semua method
// static, gak perlu di-instansiasi, panggil langsung FileIOService.xxx().
//
// Complexity baca/tulisnya O(n) di mana n = jumlah record, soalnya
// setiap operasi selalu proses seluruh isi file (gak ada partial read/write
// di sini, beda kalau pakai database).
export class FileIOService {

  // Mastiin folder data/ dan file mahasiswa.json udah ada sebelum dipakai.
  // Dipanggil sekali pas server pertama kali start.
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

  static async readAll(): Promise<object[]> {
    try {
      const raw = await fs.readFile(DATA_FILE, 'utf-8');
      return JSON.parse(raw) as object[];
    } catch (error) {
      throw new FileIOError('baca', (error as Error).message);
    }
  }

  // Overwrite seluruh isi file, bukan append. Jadi tiap kali ada
  // perubahan (tambah/edit/hapus mahasiswa), caller harus kirim
  // array lengkap, bukan cuma data yang berubah.
  static async writeAll(data: object[]): Promise<void> {
    try {
      const json = JSON.stringify(data, null, 2);
      await fs.writeFile(DATA_FILE, json, 'utf-8');
    } catch (error) {
      throw new FileIOError('tulis', (error as Error).message);
    }
  }

  // Ubah array of object jadi string CSV. Header diambil dari key
  // object pertama, jadi asumsinya semua object di array punya
  // struktur field yang sama.
  static exportCSV(data: Record<string, unknown>[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
      headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  }
}