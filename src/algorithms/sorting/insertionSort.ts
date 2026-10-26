import type { SortAlgorithm } from "../../core/types";

export const insertionSort: SortAlgorithm = {
  meta: { name: "Insertion Sort", best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  code: [
    "for i from 1 to n-1:",
    "  j = i",
    "  while j > 0 and arr[j-1] > arr[j]:",
    "    swap(arr[j-1], arr[j])",
    "    j = j - 1",
  ],
  *run(input) {
    const arr = [...input];
    for (let i = 1; i < arr.length; i++) {
      let j = i;
      while (j > 0) {
        const a = arr[j - 1];
        const b = arr[j];
        yield { type: "compare", indices: [j - 1, j], line: 2, explain: `Is ${a} greater than ${b}?` };
        if (a <= b) break;
        [arr[j - 1], arr[j]] = [b, a];
        yield { type: "swap", indices: [j - 1, j], line: 3, explain: `Yes, so move ${b} one step to the left.` };
        j--;
      }
    }
  },
};