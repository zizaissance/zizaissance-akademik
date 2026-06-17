/**
 * Custom exception untuk validasi input mahasiswa.
 * Dilempar ketika data tidak memenuhi format yang ditentukan.
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * @abstract @class Mahasiswa
 * @description Base class untuk seluruh data mahasiswa.
 * Enkapsulasi: semua property private, hanya bisa diakses via getter/setter.
 * Polimorfisme: method getStatus() dan getKategori() wajib di-override subclass.
 */
export abstract class Mahasiswa {
  // ── Private properties (Enkapsulasi) ──────────────────────
  private _nim: string;
  private _nama: string;
  private _jurusan: string;
  private _email: string;
  private _ipk: number;
  private _createdAt: Date;

  // ── Regex Patterns untuk validasi ─────────────────────────
  private static readonly NIM_REGEX = /^[1-9]\d{7,14}$/;
  private static readonly NAMA_REGEX   = /^[A-Za-z\s]{3,60}$/;
  private static readonly EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  private static readonly IPK_REGEX    = /^([0-3](\.\d{1,2})?|4(\.0{1,2})?)$/;

  // ── Konstruktor ───────────────────────────────────────────
  constructor(
    nim: string,
    nama: string,
    jurusan: string,
    email: string,
    ipk: number
  ) {
    // Validasi semua input sebelum menyimpan
    Mahasiswa.validateNIM(nim);
    Mahasiswa.validateNama(nama);
    Mahasiswa.validateEmail(email);
    Mahasiswa.validateIPK(ipk);

    this._nim       = nim;
    this._nama      = nama;
    this._jurusan   = jurusan;
    this._email     = email;
    this._ipk       = ipk;
    this._createdAt = new Date();
  }

  // ── Getters (akses baca property private) ─────────────────
  get nim():       string { return this._nim; }
  get nama():      string { return this._nama; }
  get jurusan():   string { return this._jurusan; }
  get email():     string { return this._email; }
  get ipk():       number { return this._ipk; }
  get createdAt(): Date   { return this._createdAt; }

  // ── Setters dengan validasi ────────────────────────────────
  set nama(value: string) {
    Mahasiswa.validateNama(value);
    this._nama = value;
  }

  set email(value: string) {
    Mahasiswa.validateEmail(value);
    this._email = value;
  }

  set ipk(value: number) {
    Mahasiswa.validateIPK(value);
    this._ipk = value;
  }

  // ── Static validation methods (Regex) ─────────────────────
  static validateNIM(nim: string): void {
    if (!this.NIM_REGEX.test(nim)) {
      throw new ValidationError(
        `NIM tidak valid: "${nim}". Harus 10 digit angka, tidak diawali 0.`
      );
    }
  }

  static validateNama(nama: string): void {
    if (!this.NAMA_REGEX.test(nama)) {
      throw new ValidationError(
        `Nama tidak valid: "${nama}". Hanya huruf dan spasi, 3-60 karakter.`
      );
    }
  }

  static validateEmail(email: string): void {
    if (!this.EMAIL_REGEX.test(email)) {
      throw new ValidationError(
        `Email tidak valid: "${email}". Harus format institusi (*.ac.id / *.edu).`
      );
    }
  }

  static validateIPK(ipk: number): void {
    if (!this.IPK_REGEX.test(String(ipk))) {
      throw new ValidationError(
        `IPK tidak valid: "${ipk}". Harus antara 0.00 – 4.00.`
      );
    }
  }

  // ── Abstract methods (Polimorfisme) ───────────────────────
  /** Wajib diimplementasi oleh subclass */
  abstract getStatus(): string;
  abstract getKategori(): string;

  // ── Konversi ke plain object (untuk File I/O JSON) ────────
  toJSON(): object {
    return {
      nim:       this._nim,
      nama:      this._nama,
      jurusan:   this._jurusan,
      email:     this._email,
      ipk:       this._ipk,
      status:    this.getStatus(),
      kategori:  this.getKategori(),
      createdAt: this._createdAt.toISOString(),
    };
  }

  // ── Untuk keperluan sorting & display ─────────────────────
  toString(): string {
    return `[${this.getStatus()}] ${this._nim} - ${this._nama} (IPK: ${this._ipk})`;
  }
}