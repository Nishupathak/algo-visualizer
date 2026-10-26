import { MinHeap } from "../core/heap";
import { WALL, type Cell, type Grid, type GridStep } from "./types";

export interface PathAlgorithm {
  name: string;
  info: string;
  guaranteesShortest: boolean; // cheapest path on weighted grids
  run: (grid: Grid, start: Cell, end: Cell) => Generator<GridStep, void, undefined>;
}

const DIRS: Cell[] = [[-1, 0], [0, 1], [1, 0], [0, -1]];
const key = (g: Grid, [r, c]: Cell) => r * g.cols + c;
const same = (a: Cell, b: Cell) => a[0] === b[0] && a[1] === b[1];
const label = ([r, c]: Cell) => `(${r}, ${c})`;

function neighbors(grid: Grid, [r, c]: Cell): Cell[] {
  const out: Cell[] = [];
  for (const [dr, dc] of DIRS) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < grid.rows && nc >= 0 && nc < grid.cols && grid.cost[nr][nc] !== WALL) {
      out.push([nr, nc]);
    }
  }
  return out;
}

export function pathCost(grid: Grid, cells: Cell[]): number {
  return cells.slice(1).reduce((sum, [r, c]) => sum + grid.cost[r][c], 0);
}

function* found(grid: Grid, prev: Map<number, number>, end: Cell): Generator<GridStep, void, undefined> {
  const cells: Cell[] = [];
  let k: number | undefined = key(grid, end);
  while (k !== undefined) {
    cells.push([Math.floor(k / grid.cols), k % grid.cols]);
    k = prev.get(k);
  }
  cells.reverse();
  yield {
    type: "path",
    cells,
    explain: `Path found: ${cells.length - 1} steps, total cost ${pathCost(grid, cells)}.`,
  };
}

function* none(): Generator<GridStep, void, undefined> {
  yield { type: "none", explain: "No path exists. The walls block every route to the goal." };
}

function* bfs(grid: Grid, start: Cell, end: Cell): Generator<GridStep, void, undefined> {
  const prev = new Map<number, number>();
  const seen = new Set<number>([key(grid, start)]);
  const queue: Cell[] = [start];
  let head = 0;
  while (head < queue.length) {
    const cur = queue[head++];
    yield { type: "visit", cell: cur, explain: `Visit ${label(cur)}, the oldest cell in the queue.` };
    if (same(cur, end)) return yield* found(grid, prev, end);
    for (const nb of neighbors(grid, cur)) {
      const nk = key(grid, nb);
      if (seen.has(nk)) continue;
      seen.add(nk);
      prev.set(nk, key(grid, cur));
      queue.push(nb);
      yield { type: "open", cell: nb, explain: `Discover ${label(nb)} and add it to the back of the queue.` };
    }
  }
  yield* none();
}

function* dfs(grid: Grid, start: Cell, end: Cell): Generator<GridStep, void, undefined> {
  const prev = new Map<number, number>();
  const visited = new Set<number>();
  const stack: { cell: Cell; from: number | undefined }[] = [{ cell: start, from: undefined }];
  while (stack.length > 0) {
    const { cell, from } = stack.pop() as { cell: Cell; from: number | undefined };
    const k = key(grid, cell);
    if (visited.has(k)) continue;
    visited.add(k);
    if (from !== undefined) prev.set(k, from);
    yield { type: "visit", cell, explain: `Visit ${label(cell)}, the newest cell on the stack. Go as deep as possible.` };
    if (same(cell, end)) return yield* found(grid, prev, end);
    for (const nb of neighbors(grid, cell)) {
      if (visited.has(key(grid, nb))) continue;
      stack.push({ cell: nb, from: k });
      yield { type: "open", cell: nb, explain: `Push ${label(nb)} onto the stack.` };
    }
  }
  yield* none();
}

interface Node { cell: Cell; g: number; h: number; f: number }

function* bestFirst(
  grid: Grid,
  start: Cell,
  end: Cell,
  useHeuristic: boolean,
): Generator<GridStep, void, undefined> {
  const h = (c: Cell) => (useHeuristic ? Math.abs(c[0] - end[0]) + Math.abs(c[1] - end[1]) : 0);
  const heap = new MinHeap<Node>((a, b) => a.f < b.f || (a.f === b.f && a.h < b.h));
  const best = new Map<number, number>([[key(grid, start), 0]]);
  const prev = new Map<number, number>();
  const done = new Set<number>();
  heap.push({ cell: start, g: 0, h: h(start), f: h(start) });

  while (heap.size > 0) {
    const node = heap.pop() as Node;
    const k = key(grid, node.cell);
    if (done.has(k)) continue;
    done.add(k);
    yield {
      type: "visit",
      cell: node.cell,
      explain: useHeuristic
        ? `Visit ${label(node.cell)}: cost so far ${node.g} + estimate to goal ${node.h} = ${node.f}, the lowest in the heap.`
        : `Visit ${label(node.cell)}: cheapest known cost so far is ${node.g}.`,
    };
    if (same(node.cell, end)) return yield* found(grid, prev, end);

    for (const nb of neighbors(grid, node.cell)) {
      const nk = key(grid, nb);
      const g = node.g + grid.cost[nb[0]][nb[1]];
      if (g < (best.get(nk) ?? Infinity)) {
        best.set(nk, g);
        prev.set(nk, k);
        heap.push({ cell: nb, g, h: h(nb), f: g + h(nb) });
        yield { type: "open", cell: nb, explain: `Found a cheaper way to ${label(nb)} (cost ${g}). Push it onto the heap.` };
      }
    }
  }
  yield* none();
}

export const pathAlgorithms: PathAlgorithm[] = [
  {
    name: "BFS",
    info: "Queue. Explores in rings. Shortest in steps, but ignores cell costs.",
    guaranteesShortest: false,
    run: bfs,
  },
  {
    name: "DFS",
    info: "Stack. Dives deep first. Finds a path, usually not a good one.",
    guaranteesShortest: false,
    run: dfs,
  },
  {
    name: "Dijkstra",
    info: "Min-heap on cost so far. Always finds the cheapest path, but explores in all directions.",
    guaranteesShortest: true,
    run: (g, s, e) => bestFirst(g, s, e, false),
  },
  {
    name: "A*",
    info: "Min-heap on cost + Manhattan estimate. Cheapest path, and usually far fewer cells explored.",
    guaranteesShortest: true,
    run: (g, s, e) => bestFirst(g, s, e, true),
  },
];