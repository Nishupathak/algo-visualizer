import { describe, it, expect } from "vitest";
import { runUserCode } from "../algorithms/custom";

describe("runUserCode", () => {
  it("runs a correct bubble sort", () => {
    const code = `for (let i = 0; i < n - 1; i++) for (let j = 0; j < n - i - 1; j++) if (compare(j, j + 1) > 0) swap(j, j + 1);`;
    const r = runUserCode(code, [5, 2, 9, 1]);
    expect(r.error).toBeNull();
    expect(r.result).toEqual([1, 2, 5, 9]);
  });

  it("rejects direct writes to arr", () => {
    const r = runUserCode(`arr[0] = 99;`, [1, 2]);
    expect(r.error).toContain("swap");
  });

  it("reports out-of-range indices", () => {
    const r = runUserCode(`swap(0, 99);`, [1, 2]);
    expect(r.error).toContain("out of range");
  });

  it("stops runaway loops that use the API", () => {
    const r = runUserCode(`while (true) compare(0, 1);`, [1, 2]);
    expect(r.error).toContain("Stopped");
  });

  it("reports syntax errors", () => {
    const r = runUserCode(`for (`, [1, 2]);
    expect(r.error).toContain("SyntaxError");
  });
});