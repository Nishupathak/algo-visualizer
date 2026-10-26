import type { SortAlgorithm } from "../../core/types";

export const bubbleSort: SortAlgorithm = {
  meta: {
    name: "Bubble Sort",
    best: "O(n)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
  },
  code: [
    "for i from 0 to n-2:",                // 0
    "  swapped = false",                   // 1
    "  for j from 0 to n-i-2:",            // 2
    "    if arr[j] > arr[j+1]:",           // 3
    "      swap(arr[j], arr[j+1])",        // 4
    "      swapped = true",                // 5
    "  arr[n-i-1] is now sorted",          // 6
    "  if not swapped: stop early",        // 7
  ],
  *run(input) {
    const arr = [...input];
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      for (let j = 0; j < n - i - 1; j++) {
        const a = arr[j];
        const b = arr[j + 1];
        yield { type: "compare", indices: [j, j + 1], line: 3, explain: `Compare ${a} and ${b}.` };
        if (a > b) {
          [arr[j], arr[j + 1]] = [b, a];
          swapped = true;
          yield { type: "swap", indices: [j, j + 1], line: 4, explain: `${a} is larger than ${b}, so swap them.` };
        }
      }
      yield { type: "sorted", index: n - i - 1, line: 6, explain: `${arr[n - i - 1]} has bubbled up to its final position.` };
      if (!swapped) break;
    }
  },
};