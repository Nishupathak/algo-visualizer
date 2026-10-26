import type { SortAlgorithm, SortStep } from "../core/types";

export const MAX_USER_STEPS = 20000;

export const STARTER_CODE = `// You get: arr (read-only), n (length)
// compare(i, j) -> returns arr[i] - arr[j]
// swap(i, j)    -> swaps two positions
// set(i, value) -> overwrites one position
// Do NOT write arr[i] = ... directly, use swap or set.

// Example: bubble sort (try breaking it on purpose!)
for (let i = 0; i < n - 1; i++) {
  for (let j = 0; j < n - i - 1; j++) {
    if (compare(j, j + 1) > 0) swap(j, j + 1);
  }
}`;

export interface UserRun {
  steps: SortStep[];
  result: number[];
  error: string | null;
}

export function runUserCode(source: string, input: number[]): UserRun {
  const arr = [...input];
  const steps: SortStep[] = [];

  const checkIndex = (i: number) => {
    if (!Number.isInteger(i) || i < 0 || i >= arr.length) {
      throw new Error(`Index ${String(i)} is out of range. Valid indices are 0 to ${arr.length - 1}.`);
    }
  };
  const push = (step: SortStep) => {
    if (steps.length >= MAX_USER_STEPS) {
      throw new Error(`Stopped after ${MAX_USER_STEPS} steps. Is there an infinite loop?`);
    }
    steps.push(step);
  };

  const compare = (i: number, j: number): number => {
    checkIndex(i);
    checkIndex(j);
    push({ type: "compare", indices: [i, j], line: -1, explain: `compare(${i}, ${j}): ${arr[i]} vs ${arr[j]}` });
    return arr[i] - arr[j];
  };
  const swap = (i: number, j: number): void => {
    checkIndex(i);
    checkIndex(j);
    const explain = `swap(${i}, ${j}): ${arr[i]} and ${arr[j]} trade places`;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    push({ type: "swap", indices: [i, j], line: -1, explain });
  };
  const set = (i: number, value: number): void => {
    checkIndex(i);
    if (!Number.isFinite(value)) throw new Error(`set(${i}, ...) needs a number, got ${String(value)}.`);
    arr[i] = value;
    push({ type: "overwrite", index: i, value, line: -1, explain: `set(${i}, ${value})` });
  };

  const view = new Proxy(arr, {
    set() {
      throw new Error("Don't write to arr directly. Use swap(i, j) or set(i, value) so the visualizer can show it.");
    },
  });

  let error: string | null = null;
  try {
    const fn = new Function("arr", "n", "compare", "swap", "set", `"use strict";\n${source}`);
    fn(view, arr.length, compare, swap, set);
  } catch (e) {
    error = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
  }
  return { steps, result: arr, error };
}

export interface CustomAlgorithm extends SortAlgorithm {
  lastResult: number[] | null;
  lastError: string | null;
}

export function createCustomAlgorithm(source: string): CustomAlgorithm {
  const algo: CustomAlgorithm = {
    meta: { name: "Your algorithm", best: "?", average: "?", worst: "?", space: "?" },
    code: source.split("\n"),
    lastResult: null,
    lastError: null,
    *run(input) {
      const { steps, result, error } = runUserCode(source, input);
      algo.lastResult = result;
      algo.lastError = error;
      yield* steps; // partial steps are kept on error, so you can see where it broke
    },
  };
  return algo;
}