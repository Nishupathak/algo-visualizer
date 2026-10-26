interface StepInfo {
  line: number;     // index into the algorithm's code array
  explain: string;  // shown under the canvas
}

export type SortStep = StepInfo &
  (
    | { type: "compare"; indices: [number, number] }
    | { type: "swap"; indices: [number, number] }
    | { type: "overwrite"; index: number; value: number }
    | { type: "sorted"; index: number }
  );

export type AlgorithmGenerator<TStep> = Generator<TStep, void, undefined>;

export interface AlgorithmMeta {
  name: string;
  best: string;
  average: string;
  worst: string;
  space: string;
}

export interface SortAlgorithm {
  meta: AlgorithmMeta;
  code: string[]; // pseudocode, one entry per line
  run: (input: number[]) => AlgorithmGenerator<SortStep>;
}