import { describe, it, expect } from "vitest";
import { sortAlgorithms } from "../algorithms";

type AnyStep = { type: string; indices?: [number, number]; index?: number; value?: number };

function replay(run: Iterable<AnyStep>, input: number[]) {
  const arr = [...input];
  for (const s of run) {
    if (s.type === "swap" && s.indices) {
      const [a, b] = s.indices;
      [arr[a], arr[b]] = [arr[b], arr[a]];
    } else if (s.type === "overwrite" && s.index !== undefined && s.value !== undefined) {
      arr[s.index] = s.value;
    }
  }
  return arr;
}

const inputs: number[][] = [
  [],
  [1],
  [2, 1],
  [5, 2, 9, 1, 3],
  [3, 3, 1, 1, 2],
  [-4, 10, 0, -7, 3],
  [1, 2, 3, 4, 5],
  [5, 4, 3, 2, 1],
  Array.from({ length: 60 }, () => Math.floor(Math.random() * 100)),
];

describe.each(sortAlgorithms)("$meta.name", (algo) => {
  it.each(inputs.map((x) => [x]))("sorts %j", (input) => {
    const expected = [...input].sort((a, b) => a - b);
    expect(replay(algo.run(input), input)).toEqual(expected);
  });

  it("does not mutate the input", () => {
    const input = [3, 1, 2];
    [...algo.run(input)];
    expect(input).toEqual([3, 1, 2]);
  });
});