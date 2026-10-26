import type { AlgorithmGenerator, SortAlgorithm, SortStep } from "../../core/types";

function* sort(arr: number[], lo: number, hi: number): AlgorithmGenerator<SortStep> {
  if (lo > hi) return;
  if (lo === hi) {
    yield { type: "sorted", index: lo, line: 4, explain: `${arr[lo]} is alone, so it is in place.` };
    return;
  }
  const pivot = arr[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    yield { type: "compare", indices: [j, hi], line: 3, explain: `Is ${arr[j]} smaller than the pivot ${pivot}?` };
    if (arr[j] < pivot) {
      if (i !== j) {
        const a = arr[i];
        const b = arr[j];
        [arr[i], arr[j]] = [b, a];
        yield { type: "swap", indices: [i, j], line: 3, explain: `Yes, move ${b} to the left side.` };
      }
      i++;
    }
  }
  if (i !== hi) {
    [arr[i], arr[hi]] = [arr[hi], arr[i]];
    yield { type: "swap", indices: [i, hi], line: 4, explain: `Place the pivot ${pivot} between the smaller and larger values.` };
  }
  yield { type: "sorted", index: i, line: 4, explain: `Pivot ${pivot} is now in its final position.` };
  yield* sort(arr, lo, i - 1);
  yield* sort(arr, i + 1, hi);
}

export const quickSort: SortAlgorithm = {
  meta: { name: "Quick Sort", best: "O(n log n)", average: "O(n log n)", worst: "O(n²)", space: "O(log n)" },
  code: [
    "quickSort(lo, hi):",
    "  pivot = arr[hi]",
    "  for j from lo to hi-1:",
    "    if arr[j] < pivot: swap(arr[i], arr[j]); i++",
    "  swap(arr[i], arr[hi])  # pivot lands in place",
    "  quickSort(lo, i-1); quickSort(i+1, hi)",
  ],
  run: (input) => sort([...input], 0, input.length - 1),
};