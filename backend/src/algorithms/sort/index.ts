import { MahasiswaDTO } from '../../services/MahasiswaService';

type SortKey   = 'nim' | 'nama' | 'ipk';
type SortOrder = 'asc' | 'desc';

export interface SortResult {
  sorted: MahasiswaDTO[];
  algorithm: string;
  steps: number;
  swaps: number;
  timeComplexity: string;
  spaceComplexity: string;
}

function compare(a: MahasiswaDTO, b: MahasiswaDTO, key: SortKey, order: SortOrder): boolean {
  const valA = a[key];
  const valB = b[key];
  return order === 'asc' ? valA > valB : valA < valB;
}

export function bubbleSort(data: MahasiswaDTO[], key: SortKey = 'nama', order: SortOrder = 'asc'): SortResult {
  const arr = [...data];
  const n = arr.length;
  let steps = 0, swaps = 0;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      steps++;
      if (compare(arr[j], arr[j + 1], key, order)) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swaps++; swapped = true;
      }
    }
    if (!swapped) break;
  }
  return { sorted: arr, algorithm: 'Bubble Sort', steps, swaps, timeComplexity: 'O(n²)', spaceComplexity: 'O(1)' };
}

export function selectionSort(data: MahasiswaDTO[], key: SortKey = 'nama', order: SortOrder = 'asc'): SortResult {
  const arr = [...data];
  const n = arr.length;
  let steps = 0, swaps = 0;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      steps++;
      if (compare(arr[minIdx], arr[j], key, order)) minIdx = j;
    }
    if (minIdx !== i) { [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]; swaps++; }
  }
  return { sorted: arr, algorithm: 'Selection Sort', steps, swaps, timeComplexity: 'O(n²)', spaceComplexity: 'O(1)' };
}

export function insertionSort(data: MahasiswaDTO[], key: SortKey = 'nama', order: SortOrder = 'asc'): SortResult {
  const arr = [...data];
  let steps = 0, swaps = 0;
  for (let i = 1; i < arr.length; i++) {
    const current = arr[i];
    let j = i - 1;
    while (j >= 0 && compare(arr[j], current, key, order)) {
      steps++; arr[j + 1] = arr[j]; swaps++; j--;
    }
    arr[j + 1] = current;
  }
  return { sorted: arr, algorithm: 'Insertion Sort', steps, swaps, timeComplexity: 'O(n²)', spaceComplexity: 'O(1)' };
}

export function mergeSort(data: MahasiswaDTO[], key: SortKey = 'nama', order: SortOrder = 'asc'): SortResult {
  let steps = 0, swaps = 0;
  function merge(left: MahasiswaDTO[], right: MahasiswaDTO[]): MahasiswaDTO[] {
    const result: MahasiswaDTO[] = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
      steps++;
      if (!compare(left[i], right[j], key, order)) { result.push(left[i++]); }
      else { result.push(right[j++]); swaps++; }
    }
    return [...result, ...left.slice(i), ...right.slice(j)];
  }
  function sort(arr: MahasiswaDTO[]): MahasiswaDTO[] {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    return merge(sort(arr.slice(0, mid)), sort(arr.slice(mid)));
  }
  return { sorted: sort([...data]), algorithm: 'Merge Sort', steps, swaps, timeComplexity: 'O(n log n)', spaceComplexity: 'O(n)' };
}

export function shellSort(data: MahasiswaDTO[], key: SortKey = 'nama', order: SortOrder = 'asc'): SortResult {
  const arr = [...data];
  let steps = 0, swaps = 0;
  let gap = Math.floor(arr.length / 2);
  while (gap > 0) {
    for (let i = gap; i < arr.length; i++) {
      const temp = arr[i];
      let j = i;
      while (j >= gap && compare(arr[j - gap], temp, key, order)) {
        steps++; arr[j] = arr[j - gap]; swaps++; j -= gap;
      }
      arr[j] = temp;
    }
    gap = Math.floor(gap / 2);
  }
  return { sorted: arr, algorithm: 'Shell Sort', steps, swaps, timeComplexity: 'O(n log² n)', spaceComplexity: 'O(1)' };
}