import { WALL, type Cell, type Grid, type GridStep } from "./types";

const COLORS = {
  empty: "#0f172a",
  wall: "#64748b",
  weight: "#92400e",
  open: "#1d4ed8",
  visited: "#0e7490",
  current: "#f97316",
  path: "#facc15",
  start: "#22c55e",
  end: "#ef4444",
};

export class GridRenderer {
  constructor(private canvas: HTMLCanvasElement) {}

  draw(grid: Grid, start: Cell, end: Cell, steps: GridStep[]) {
    const ctx = this.canvas.getContext("2d")!;
    const size = this.canvas.width / grid.cols;
    const state = new Uint8Array(grid.rows * grid.cols); // 0 none, 1 open, 2 visited, 3 path
    let current = -1;

    for (const s of steps) {
      if (s.type === "open") {
        const k = s.cell[0] * grid.cols + s.cell[1];
        if (state[k] === 0) state[k] = 1;
      } else if (s.type === "visit") {
        current = s.cell[0] * grid.cols + s.cell[1];
        state[current] = 2;
      } else if (s.type === "path") {
        for (const [r, c] of s.cells) state[r * grid.cols + c] = 3;
        current = -1;
      }
    }

    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let r = 0; r < grid.rows; r++) {
      for (let c = 0; c < grid.cols; c++) {
        const k = r * grid.cols + c;
        const cost = grid.cost[r][c];
        let color = COLORS.empty;
        if (cost === WALL) color = COLORS.wall;
        else if (state[k] === 3) color = COLORS.path;
        else if (k === current) color = COLORS.current;
        else if (state[k] === 2) color = COLORS.visited;
        else if (state[k] === 1) color = COLORS.open;
        else if (cost > 1) color = COLORS.weight;
        if (r === start[0] && c === start[1]) color = COLORS.start;
        if (r === end[0] && c === end[1]) color = COLORS.end;
        ctx.fillStyle = color;
        ctx.fillRect(c * size + 0.5, r * size + 0.5, size - 1, size - 1);
      }
    }
  }
}