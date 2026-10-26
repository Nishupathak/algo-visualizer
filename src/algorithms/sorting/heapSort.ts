import type { AlgorithmGenerator, SortAlgorithm, SortStep } from "../../core/types";

function* siftDown(arr: number[], n: number, start: number, line: number): AlgorithmGenerator<SortStep> {
  let i = start;
  while (true) {
    let largest = i;
    const l = 2 * i + 1;
    const r = 2 * i + 2;
    if (l < n) {
      yield { type: "compare", indices: [l, largest], line, explain: `Is left child ${arr[l]} bigger than ${arr[largest]}?` };
      if (arr[l] > arr[largest]) largest = l;
    }
    if (r < n) {
      yield { type: "compare", indices: [r, largest], line, explain: `Is right child ${arr[r]} bigger than ${arr[largest]}?` };
      if (arr[r] > arr[largest]) largest = r;
    }
    if (largest === i) return;
    const a = arr[i];
    const b = arr[largest];
    [arr[i], arr[largest]] = [b, a];
    yield { type: "swap", indices: [i, largest], line: 5, explain: `Swap ${a} with its larger child ${b}.` };
    i = largest;
  }
}

export const heapSort: SortAlgorithm = {
  meta: { name: "Heap Sort", best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(1)" },
  code: [
    "build a max-heap from arr",
    "for end from n-1 down to 1:",
    "  swap(arr[0], arr[end])  # max goes to the back",
    "  arr[end] is now sorted",
    "  siftDown(0) within arr[0..end-1]",
    "siftDown: swap with the larger child while smaller",
  ],
  *run(input) {
    const arr = [...input];
    const n = arr.length;
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      yield* siftDown(arr, n, i, 0);
    }
    for (let end = n - 1; end > 0; end--) {
      const a = arr[0];
      [arr[0], arr[end]] = [arr[end], arr[0]];
      yield { type: "swap", indices: [0, end], line: 2, explain: `Move the maximum ${a} to position ${end}.` };
      yield { type: "sorted", index: end, line: 3, explain: `${a} is in its final position.` };
      yield* siftDown(arr, end, 0, 4);
    }
    if (n > 0) yield { type: "sorted", index: 0, line: 3, explain: `${arr[0]} is in its final position.` };
  },
};