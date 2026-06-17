/**
 * @class AppException
 * @description Base exception untuk seluruh error di aplikasi.
 * Semua custom exception harus extends class ini.
 */
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

/**
 * @class ValidationError
 * @description Dilempar ketika input tidak memenuhi format Regex.
 * HTTP Status: 400 Bad Request
 */
export class ValidationError extends AppException {
  constructor(message: string) {
    super(message, 400);
  }
}

/**
 * @class MahasiswaNotFoundError
 * @description Dilempar ketika mahasiswa dengan NIM tertentu tidak ditemukan.
 * HTTP Status: 404 Not Found
 */
export class MahasiswaNotFoundError extends AppException {
  public readonly nim: string;

  constructor(nim: string) {
    super(`Mahasiswa dengan NIM ${nim} tidak ditemukan`, 404);
    this.nim = nim;
  }
}

/**
 * @class DuplicateNIMError
 * @description Dilempar ketika NIM yang didaftarkan sudah ada di sistem.
 * HTTP Status: 409 Conflict
 */
export class DuplicateNIMError extends AppException {
  public readonly nim: string;

  constructor(nim: string) {
    super(`NIM ${nim} sudah terdaftar dalam sistem`, 409);
    this.nim = nim;
  }
}

/**
 * @class FileIOError
 * @description Dilempar ketika terjadi kegagalan baca/tulis file.
 * HTTP Status: 500 Internal Server Error
 */
export class FileIOError extends AppException {
  constructor(operation: 'baca' | 'tulis', detail: string) {
    super(`Gagal ${operation} file data: ${detail}`, 500);
  }
}