import { MahasiswaDTO } from '../../services/MahasiswaService';

export interface SearchResult {
  results: MahasiswaDTO[];
  algorithm: string;
  steps: number;
  timeComplexity: string;
  spaceComplexity: string;
}

// Linear Search: scan dari index 0 sampai akhir, cocokkan keyword ke
// field yang dipilih. Gak butuh data terurut, dan mendukung partial
// match (pakai includes, bukan exact match).
// Time: O(n) | Space: O(1)
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

// Binary Search: cari NIM dengan cara bagi array jadi dua terus-menerus.
// Jauh lebih cepat dari linear (O(log n) vs O(n)), tapi syaratnya data
// harus sudah diurutkan by NIM dulu sebelum fungsi ini dipanggil.
// Caller yang ngurusin sort-nya (lihat MahasiswaController.search).
// Time: O(log n) | Space: O(1)
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

// Sequential Search: variasi linear search yang ngecek beberapa field
// sekaligus per elemen (nim, nama, jurusan, email). Cocok buat pencarian
// bebas tanpa harus tahu user lagi cari di field mana.
// Break di dalam loop field supaya satu mahasiswa gak masuk results
// lebih dari sekali kalau keywordnya cocok di beberapa field sekaligus.
// Time: O(n * k) di mana k = jumlah field yang dicek (4) | Space: O(1)
export function sequentialSearch(
  data: MahasiswaDTO[],
  keyword: string
): SearchResult {
  const results: MahasiswaDTO[] = [];
  let steps = 0;

  const fields: (keyof MahasiswaDTO)[] = ['nim', 'nama', 'jurusan', 'email'];

  for (let i = 0; i < data.length; i++) {
    steps++;
    for (const field of fields) {
      const value = String(data[i][field] ?? '').toLowerCase();
      if (value.includes(keyword.toLowerCase())) {
        results.push(data[i]);
        break;
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