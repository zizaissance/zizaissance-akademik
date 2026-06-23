// Semua custom exception di aplikasi ini extends AppException supaya
// error handler bisa tangkap semuanya lewat satu instanceof check,
// dan statusCode sudah tersedia langsung tanpa perlu mapping manual.
export class AppException extends Error {
  public readonly statusCode: number;
  public readonly timestamp: Date;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name      = this.constructor.name;
    this.statusCode = statusCode;
    this.timestamp  = new Date();
  }
}

// 400: input tidak lolos validasi regex (NIM, nama, email, IPK)
export class ValidationError extends AppException {
  constructor(message: string) {
    super(message, 400);
  }
}

// 404: mahasiswa dengan NIM yang diminta tidak ada di file
export class MahasiswaNotFoundError extends AppException {
  public readonly nim: string;

  constructor(nim: string) {
    super(`Mahasiswa dengan NIM ${nim} tidak ditemukan`, 404);
    this.nim = nim;
  }
}

// 409: NIM sudah dipakai oleh mahasiswa lain, tidak bisa duplikat
export class DuplicateNIMError extends AppException {
  public readonly nim: string;

  constructor(nim: string) {
    super(`NIM ${nim} sudah terdaftar dalam sistem`, 409);
    this.nim = nim;
  }
}

// 500: operasi fs.readFile/writeFile gagal (misal disk penuh, permission)
export class FileIOError extends AppException {
  constructor(operation: 'baca' | 'tulis', detail: string) {
    super(`Gagal ${operation} file data: ${detail}`, 500);
  }
}