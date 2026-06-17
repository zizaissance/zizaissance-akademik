import { MahasiswaAktif } from '../models/MahasiswaAktif';
import { MahasiswaLulus } from '../models/MahasiswaLulus';
import { FileIOService  } from './FileIOService';
import {
  MahasiswaNotFoundError,
  DuplicateNIMError,
} from '../exceptions';

export interface MahasiswaDTO {
  nim:         string;
  nama:        string;
  jurusan:     string;
  email:       string;
  ipk:         number;
  status:      'aktif' | 'lulus';
  semester?:   number;
  angkatan?:   number;
  tahunLulus?: number;
}

/**
 * @class MahasiswaService
 * @description Mengelola seluruh operasi CRUD mahasiswa.
 * @complexity CRUD: O(n) | Space: O(n)
 */
export class MahasiswaService {

  /**
   * @method getAll
   * @complexity Time: O(n) | Space: O(n)
   */
  static async getAll(): Promise<MahasiswaDTO[]> {
    return await FileIOService.readAll() as MahasiswaDTO[];
  }

  /**
   * @method getByNIM
   * @complexity Time: O(n) | Space: O(1)
   */
  static async getByNIM(nim: string): Promise<MahasiswaDTO> {
    const data = await FileIOService.readAll() as MahasiswaDTO[];
    const found = data.find(m => m.nim === nim);
    if (!found) throw new MahasiswaNotFoundError(nim);
    return found;
  }

  /**
   * @method create
   * @complexity Time: O(n) | Space: O(1)
   */
  static async create(dto: MahasiswaDTO): Promise<MahasiswaDTO> {
    const data = await FileIOService.readAll() as MahasiswaDTO[];

    const duplicate = data.find(m => m.nim === dto.nim);
    if (duplicate) throw new DuplicateNIMError(dto.nim);

    let mahasiswa;
    if (dto.status === 'aktif') {
      mahasiswa = new MahasiswaAktif(
        dto.nim, dto.nama, dto.jurusan, dto.email, dto.ipk,
        dto.semester  ?? 1,
        dto.angkatan  ?? new Date().getFullYear()
      );
    } else {
      mahasiswa = new MahasiswaLulus(
        dto.nim, dto.nama, dto.jurusan, dto.email, dto.ipk,
        dto.tahunLulus ?? new Date().getFullYear()
      );
    }

    const json = mahasiswa.toJSON() as MahasiswaDTO;
    data.push(json);
    await FileIOService.writeAll(data);
    return json;
  }

  /**
   * @method update
   * @complexity Time: O(n) | Space: O(1)
   */
  static async update(nim: string, dto: Partial<MahasiswaDTO>): Promise<MahasiswaDTO> {
    const data = await FileIOService.readAll() as MahasiswaDTO[];
    const index = data.findIndex(m => m.nim === nim);
    if (index === -1) throw new MahasiswaNotFoundError(nim);

    data[index] = { ...data[index], ...dto, nim };
    await FileIOService.writeAll(data);
    return data[index];
  }

  /**
   * @method delete
   * @complexity Time: O(n) | Space: O(1)
   */
  static async delete(nim: string): Promise<void> {
    const data = await FileIOService.readAll() as MahasiswaDTO[];
    const index = data.findIndex(m => m.nim === nim);
    if (index === -1) throw new MahasiswaNotFoundError(nim);

    data.splice(index, 1);
    await FileIOService.writeAll(data);
  }

  /**
   * @method getStats
   * @complexity Time: O(n) | Space: O(k)
   */
  static async getStats(): Promise<object> {
    const data = await FileIOService.readAll() as MahasiswaDTO[];
    if (data.length === 0) {
      return { total: 0, rataIPK: 0, aktif: 0, lulus: 0, perJurusan: {} };
    }

    const total   = data.length;
    const aktif   = data.filter(m => m.status?.toLowerCase() === 'aktif').length;
    const lulus   = data.filter(m => m.status?.toLowerCase() === 'lulus').length;
    const rataIPK = +(data.reduce((sum, m) => sum + m.ipk, 0) / total).toFixed(2);

    const perJurusan: Record<string, number> = {};
    for (const m of data) {
      perJurusan[m.jurusan] = (perJurusan[m.jurusan] ?? 0) + 1;
    }

    // Hitung persentase per jurusan
    const perJurusanPersen: Record<string, number> = {};
    for (const [j, count] of Object.entries(perJurusan)) {
      perJurusanPersen[j] = Math.round((count / total) * 100);
    }

    return { total, rataIPK, aktif, lulus, perJurusan: perJurusanPersen };
  }
}