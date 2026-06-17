import { Mahasiswa, ValidationError } from './Mahasiswa';

/**
 * @class MahasiswaLulus
 * @extends Mahasiswa
 * @description Representasi mahasiswa yang sudah lulus.
 * Menambahkan property tahun lulus dan predikat kelulusan.
 */
export class MahasiswaLulus extends Mahasiswa {
  private _tahunLulus: number;
  private _predikat: string;

  private static readonly TAHUN_REGEX = /^20\d{2}$/;

  constructor(
    nim: string,
    nama: string,
    jurusan: string,
    email: string,
    ipk: number,
    tahunLulus: number
  ) {
    // Panggil konstruktor parent — Pewarisan
    super(nim, nama, jurusan, email, ipk);

    MahasiswaLulus.validateTahunLulus(tahunLulus);

    this._tahunLulus = tahunLulus;
    this._predikat   = MahasiswaLulus.hitungPredikat(ipk);
  }

  // ── Getters ───────────────────────────────────────────────
  get tahunLulus(): number { return this._tahunLulus; }
  get predikat():   string { return this._predikat; }

  // ── Validasi ──────────────────────────────────────────────
  static validateTahunLulus(tahun: number): void {
    if (!this.TAHUN_REGEX.test(String(tahun))) {
      throw new ValidationError(
        `Tahun lulus tidak valid: "${tahun}". Format: 20xx.`
      );
    }
  }

  // ── Hitung predikat berdasarkan IPK ───────────────────────
  static hitungPredikat(ipk: number): string {
    if (ipk >= 3.75) return 'Dengan Pujian';
    if (ipk >= 3.50) return 'Sangat Memuaskan';
    if (ipk >= 3.00) return 'Memuaskan';
    return 'Cukup';
  }

  // ── Polimorfisme: override method abstrak parent ──────────
  getStatus(): string {
    return 'Lulus';
  }

  getKategori(): string {
    return this._predikat;
  }

  // ── Override toJSON — tambah field tahun lulus & predikat ─
  toJSON(): object {
    return {
      ...super.toJSON(),
      tahunLulus: this._tahunLulus,
      predikat:   this._predikat,
    };
  }
}