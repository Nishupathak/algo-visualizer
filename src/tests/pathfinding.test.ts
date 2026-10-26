import { describe, it, expect } from "vitest";
import { MinHeap } from "../core/heap";
import { pathAlgorithms, pathCost } from "../pathfinding/algorithms";
import { WALL, WEIGHT, type Cell, type Grid, type GridStep, type PathStep } from "../pathfinding/types";

const gridFrom = (rows: string[]): Grid => ({
  rows: rows.length,
  cols: rows[0].length,
  cost: rows.map((r) => [...r].map((ch) => (ch === "#" ? WALL : ch === "m" ? WEIGHT : 1))),
});

const pathOf = (steps: GridStep[]) => steps.find((s): s is PathStep => s.type === "path");
const byName = (name: string) => pathAlgorithms.find((a) => a.name === name)!;

describe("MinHeap", () => {
  it("pops in sorted order", () => {
    const heap = new MinHeap<number>((a, b) => a < b);
    const input = Array.from({ length: 200 }, () => Math.floor(Math.random() * 1000));
    input.forEach((x) => heap.push(x));
    const out: number[] = [];
    while (heap.size > 0) out.push(heap.pop() as number);
    expect(out).toEqual([...input].sort((a, b) => a - b));
  });
});

describe("pathfinding", () => {
  const open = gridFrom(["....."," ".repeat(0) + ".....", ".....", ".....", "....."]);
  const start: Cell = [0, 0];
  const end: Cell = [4, 4];

  it.each(pathAlgorithms.map((a) => [a.name]))("%s finds a path on an open grid", (name) => {
    const path = pathOf([...byName(name).run(open, start, end)]);
    expect(path).toBeDefined();
    expect(path!.cells[0]).toEqual(start);
    expect(path!.cells.at(-1)).toEqual(end);
  });

  it.each(["BFS", "Dijkstra", "A*"])("%s gives the shortest path in steps on an open grid", (name) => {
    const path = pathOf([...byName(name).run(open, start, end)]);
    expect(path!.cells.length - 1).toBe(8);
  });

  it.each(pathAlgorithms.map((a) => [a.name]))("%s reports no path when walled in", (name) => {
    const blocked = gridFrom([".....", ".....", "#####", ".....", "....."]);
    const steps = [...byName(name).run(blocked, start, end)];
    expect(steps.at(-1)?.type).toBe("none");
  });

  it("Dijkstra and A* agree on cost, and never lose to BFS, on random weighted grids", () => {
    for (let t = 0; t < 25; t++) {
      const g: Grid = {
        rows: 12,
        cols: 12,
        cost: Array.from({ length: 12 }, () =>
          Array.from({ length: 12 }, () => {
            const x = Math.random();
            return x < 0.2 ? WALL : x < 0.4 ? WEIGHT : 1;
          }),
        ),
      };
      g.cost[0][0] = 1;
      g.cost[11][11] = 1;
      const s: Cell = [0, 0];
      const e: Cell = [11, 11];
      const dij = pathOf([...byName("Dijkstra").run(g, s, e)]);
      const astar = pathOf([...byName("A*").run(g, s, e)]);
      const bfs = pathOf([...byName("BFS").run(g, s, e)]);
      expect(Boolean(dij)).toBe(Boolean(astar));
      expect(Boolean(dij)).toBe(Boolean(bfs));
      if (dij && astar && bfs) {
        expect(pathCost(g, astar.cells)).toBe(pathCost(g, dij.cells));
        expect(pathCost(g, dij.cells)).toBeLessThanOrEqual(pathCost(g, bfs.cells));
      }
    }
  });
});