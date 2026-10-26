import type { AlgorithmGenerator, SortAlgorithm, SortStep } from "../../core/types";

function* sort(arr: number[], lo: number, hi: number): AlgorithmGenerator<SortStep> {
  if (lo >= hi) return;
  const mid = Math.floor((lo + hi) / 2);
  yield* sort(arr, lo, mid);
  yield* sort(arr, mid + 1, hi);

  const left = arr.slice(lo, mid + 1);
  const right = arr.slice(mid + 1, hi + 1);
  let i = 0;
  let j = 0;
  let k = lo;

  while (i < left.length && j < right.length) {
    yield { type: "compare", indices: [lo + i, mid + 1 + j], line: 4, explain: `Compare ${left[i]} (left half) with ${right[j]} (right half).` };
    const take = left[i] <= right[j] ? left[i++] : right[j++];
    arr[k] = take;
    yield { type: "overwrite", index: k, value: take, line: 5, explain: `The smaller one, ${take}, goes into position ${k}.` };
    k++;
  }
  while (i < left.length) {
    const v = left[i++];
    arr[k] = v;
    yield { type: "overwrite", index: k, value: v, line: 5, explain: `Right half is empty, so copy ${v} into position ${k}.` };
    k++;
  }
  while (j < right.length) {
    const v = right[j++];
    arr[k] = v;
    yield { type: "overwrite", index: k, value: v, line: 5, explain: `Left half is empty, so copy ${v} into position ${k}.` };
    k++;
  }
}

export const mergeSort: SortAlgorithm = {
  meta: { name: "Merge Sort", best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(n)" },
  code: [
    "mergeSort(lo, hi):",
    "  if lo >= hi: return",
    "  mid = (lo + hi) / 2",
    "  mergeSort(lo, mid); mergeSort(mid+1, hi)",
    "  merge: compare the front of each half",
    "  write the smaller value back into arr[k]",
  ],
  run: (input) => sort([...input], 0, input.length - 1),
};