import type { SortAlgorithm } from "../../core/types";

export const selectionSort: SortAlgorithm = {
  meta: { name: "Selection Sort", best: "O(n²)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  code: [
    "for i from 0 to n-2:",
    "  min = i",
    "  for j from i+1 to n-1:",
    "    if arr[j] < arr[min]: min = j",
    "  swap(arr[i], arr[min])",
    "  arr[i] is now sorted",
  ],
  *run(input) {
    const arr = [...input];
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      let min = i;
      for (let j = i + 1; j < n; j++) {
        yield { type: "compare", indices: [min, j], line: 3, explain: `Is ${arr[j]} smaller than the current minimum ${arr[min]}?` };
        if (arr[j] < arr[min]) min = j;
      }
      if (min !== i) {
        const a = arr[i];
        const b = arr[min];
        [arr[i], arr[min]] = [b, a];
        yield { type: "swap", indices: [i, min], line: 4, explain: `Put the minimum ${b} at position ${i}.` };
      }
      yield { type: "sorted", index: i, line: 5, explain: `${arr[i]} is in its final position.` };
    }
  },
};