import { Mahasiswa, ValidationError } from './Mahasiswa';

// Subclass untuk mahasiswa yang masih aktif kuliah. Nambah dua property
// tambahan (semester dan angkatan) yang gak ada di base class, plus
// implementasi getStatus() dan getKategori() yang diwajibkan parent.
export class MahasiswaAktif extends Mahasiswa {
  private _semester: number;
  private _angkatan: number;

  private static readonly SEMESTER_REGEX = /^([1-9]|1[0-4])$/;
  private static readonly ANGKATAN_REGEX = /^20\d{2}$/;

  constructor(
    nim: string,
    nama: string,
    jurusan: string,
    email: string,
    ipk: number,
    semester: number,
    angkatan: number
  ) {
    super(nim, nama, jurusan, email, ipk);

    MahasiswaAktif.validateSemester(semester);
    MahasiswaAktif.validateAngkatan(angkatan);

    this._semester = semester;
    this._angkatan = angkatan;
  }

  get semester(): number { return this._semester; }
  get angkatan(): number { return this._angkatan; }

  set semester(value: number) {
    MahasiswaAktif.validateSemester(value);
    this._semester = value;
  }

  static validateSemester(semester: number): void {
    if (!this.SEMESTER_REGEX.test(String(semester))) {
      throw new ValidationError(
        `Semester tidak valid: "${semester}". Harus antara 1–14.`
      );
    }
  }

  static validateAngkatan(angkatan: number): void {
    if (!this.ANGKATAN_REGEX.test(String(angkatan))) {
      throw new ValidationError(
        `Angkatan tidak valid: "${angkatan}". Format: 20xx.`
      );
    }
  }

  getStatus(): string {
    return 'Aktif';
  }

  // Kategori IPK berdasarkan rentang standar akademik
  getKategori(): string {
    if (this.ipk >= 3.75) return 'Cumlaude';
    if (this.ipk >= 3.50) return 'Sangat Memuaskan';
    if (this.ipk >= 3.00) return 'Memuaskan';
    if (this.ipk >= 2.00) return 'Cukup';
    return 'Kurang';
  }

  // Extend toJSON parent supaya semester dan angkatan ikut tersimpan ke file
  toJSON(): object {
    return {
      ...super.toJSON(),
      semester: this._semester,
      angkatan: this._angkatan,
    };
  }
}