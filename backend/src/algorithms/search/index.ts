import { MahasiswaDTO } from '../../services/MahasiswaService';

export interface SearchResult {
  results: MahasiswaDTO[];
  algorithm: string;
  steps: number;
  timeComplexity: string;
  spaceComplexity: string;
}

/**
 * @function linearSearch
 * @description Mencari mahasiswa secara berurutan dari index 0.
 * Tidak memerlukan data terurut. Cocok untuk semua kondisi.
 * @complexity Time: O(n) | Space: O(1)
 */
export function linearSearch(
  data: MahasiswaDTO[],
  keyword: string,
  field: keyof MahasiswaDTO = 'nama'
): SearchResult {
  const results: MahasiswaDTO[] = [];
  let steps = 0;

  for (let i = 0; i < data.length; i++) {
    steps++;
    const value = String(data[i][field] ?? '').toLowerCase();
    if (value.includes(keyword.toLowerCase())) {
      results.push(data[i]);
    }
  }

  return {
    results,
    algorithm: 'Linear Search',
    steps,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  };
}

/**
 * @function binarySearch
 * @description Mencari mahasiswa berdasarkan NIM (data harus terurut).
 * Membagi array menjadi dua di setiap iterasi.
 * @complexity Time: O(log n) | Space: O(1)
 */
export function binarySearch(
  sortedData: MahasiswaDTO[],
  targetNIM: string
): SearchResult {
  let left  = 0;
  let right = sortedData.length - 1;
  let steps = 0;
  const results: MahasiswaDTO[] = [];

  while (left <= right) {
    steps++;
    const mid    = Math.floor((left + right) / 2);
    const midNIM = sortedData[mid].nim;

    if (midNIM === targetNIM) {
      results.push(sortedData[mid]);
      break;
    }
    if (midNIM < targetNIM) left  = mid + 1;
    else                     right = mid - 1;
  }

  return {
    results,
    algorithm: 'Binary Search',
    steps,
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
  };
}

/**
 * @function sequentialSearch
 * @description Mencari mahasiswa yang cocok dengan beberapa field sekaligus.
 * Variasi linear search dengan multi-field matching.
 * @complexity Time: O(n * k) — k = jumlah field | Space: O(1)
 */
export function sequentialSearch(
  data: MahasiswaDTO[],
  keyword: string
): SearchResult {
  const results: MahasiswaDTO[] = [];
  let steps = 0;

  // Field yang dicari secara berurutan
  const fields: (keyof MahasiswaDTO)[] = ['nim', 'nama', 'jurusan', 'email'];

  for (let i = 0; i < data.length; i++) {
    steps++;
    for (const field of fields) {
      const value = String(data[i][field] ?? '').toLowerCase();
      if (value.includes(keyword.toLowerCase())) {
        results.push(data[i]);
        break; // Jangan tambah duplikat jika cocok di lebih dari 1 field
      }
    }
  }

  return {
    results,
    algorithm: 'Sequential Search',
    steps,
    timeComplexity: 'O(n × k)',
    spaceComplexity: 'O(1)',
  };
}