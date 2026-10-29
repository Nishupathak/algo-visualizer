import "../style.css";
import { Timeline } from "../core/timeline";
import { bindShortcuts } from "../core/shortcuts";
import { pathAlgorithms, pathCost } from "./algorithms";
import { GridRenderer } from "./renderer";
import { WALL, WEIGHT, type Cell, type Grid, type GridStep, type PathStep } from "./types";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const canvas = $<HTMLCanvasElement>("canvas");
const algoSelect = $<HTMLSelectElement>("algo");
const toolSelect = $<HTMLSelectElement>("tool");
const backBtn = $<HTMLButtonElement>("back");
const playBtn = $<HTMLButtonElement>("play");
const stepBtn = $<HTMLButtonElement>("step");
const resetBtn = $<HTMLButtonElement>("reset");
const randomBtn = $<HTMLButtonElement>("random");
const clearBtn = $<HTMLButtonElement>("clear");
const compareBtn = $<HTMLButtonElement>("compare");
const speedInput = $<HTMLInputElement>("speed");
const scrub = $<HTMLInputElement>("scrub");
const infoEl = $<HTMLDivElement>("info");
const explainEl = $<HTMLDivElement>("explain");
const statsEl = $<HTMLDivElement>("stats");
const compareEl = $<HTMLDivElement>("compare-result");

const ROWS = 25;
const COLS = 50;
const TOOLS = { wall: WALL, weight: WEIGHT, erase: 1 } as const;

const renderer = new GridRenderer(canvas);
const grid: Grid = {
  rows: ROWS,
  cols: COLS,
  cost: Array.from({ length: ROWS }, () => Array<number>(COLS).fill(1)),
};
let start: Cell = [12, 8];
let end: Cell = [12, 41];

const same = (a: Cell, b: Cell) => a[0] === b[0] && a[1] === b[1];
const speedToDelay = () => 201 - Number(speedInput.value);
const isPath = (s: GridStep): s is PathStep => s.type === "path";

const timeline = new Timeline<GridStep>((pos) => {
  const len = timeline.length;
  const shown = timeline.upTo(pos);
  renderer.draw(grid, start, end, shown);

  scrub.max = String(len);
  scrub.value = String(pos);

  const visited = shown.filter((s) => s.type === "visit").length;
  const path = shown.find(isPath);
  statsEl.textContent =
    `Step ${pos}/${len} | Cells visited: ${visited}` +
    (path ? ` | Path: ${path.cells.length - 1} steps, cost ${pathCost(grid, path.cells)}` : "");

  explainEl.textContent = pos > 0 ? timeline.stepAt(pos - 1).explain : "Press Play or Step to begin.";
  if (!timeline.isPlaying) playBtn.textContent = "Play";
});

function rebuild() {
  const algo = pathAlgorithms[algoSelect.selectedIndex];
  infoEl.textContent = `${algo.name}: ${algo.info}`;
  timeline.setSpeed(speedToDelay());
  timeline.load([...algo.run(grid, start, end)]);
}

// --- drawing on the grid ---
type Drag = "start" | "end" | "paint" | null;
let drag: Drag = null;

function cellAt(e: PointerEvent): Cell | null {
  const rect = canvas.getBoundingClientRect();
  const c = Math.floor(((e.clientX - rect.left) / rect.width) * COLS);
  const r = Math.floor(((e.clientY - rect.top) / rect.height) * ROWS);
  return r >= 0 && r < ROWS && c >= 0 && c < COLS ? [r, c] : null;
}

function paint(cell: Cell): boolean {
  if (same(cell, start) || same(cell, end)) return false;
  const value = TOOLS[toolSelect.value as keyof typeof TOOLS];
  if (grid.cost[cell[0]][cell[1]] === value) return false;
  grid.cost[cell[0]][cell[1]] = value;
  return true;
}

canvas.addEventListener("pointerdown", (e) => {
  const cell = cellAt(e);
  if (!cell) return;
  canvas.setPointerCapture(e.pointerId);
  if (same(cell, start)) drag = "start";
  else if (same(cell, end)) drag = "end";
  else {
    drag = "paint";
    if (paint(cell)) rebuild();
  }
});

canvas.addEventListener("pointermove", (e) => {
  if (!drag) return;
  const cell = cellAt(e);
  if (!cell) return;
  if (drag === "paint") {
    if (paint(cell)) rebuild();
    return;
  }
  const other = drag === "start" ? end : start;
  const current = drag === "start" ? start : end;
  if (grid.cost[cell[0]][cell[1]] === WALL || same(cell, other) || same(cell, current)) return;
  if (drag === "start") start = cell;
  else end = cell;
  rebuild();
});

const stopDrag = () => { drag = null; };
canvas.addEventListener("pointerup", stopDrag);
canvas.addEventListener("pointercancel", stopDrag);

// --- compare ---
function compareAll() {
  const rows = pathAlgorithms.map((algo) => {
    const steps = [...algo.run(grid, start, end)];
    const visited = steps.filter((s) => s.type === "visit").length;
    const path = steps.find(isPath);
    return {
      name: algo.name,
      visited,
      steps: path ? path.cells.length - 1 : null,
      cost: path ? pathCost(grid, path.cells) : null,
    };
  });
  const costs = rows.map((r) => r.cost).filter((c): c is number => c !== null);
  const bestCost = costs.length ? Math.min(...costs) : null;
  const body = rows
    .map(
      (r) =>
        `<tr class="${r.cost !== null && r.cost === bestCost ? "best" : ""}"><td>${r.name}</td><td>${r.visited}</td><td>${r.steps ?? "no path"}</td><td>${r.cost ?? "-"}</td></tr>`,
    )
    .join("");
  compareEl.innerHTML =
    `<h2>Same board, every algorithm (green = cheapest path)</h2>` +
    `<table><thead><tr><th>Algorithm</th><th>Cells visited</th><th>Path steps</th><th>Path cost</th></tr></thead><tbody>${body}</tbody></table>`;
}

// --- events ---
playBtn.addEventListener("click", () => {
  if (timeline.isPlaying) {
    timeline.pause();
    playBtn.textContent = "Play";
  } else {
    timeline.play();
    playBtn.textContent = "Pause";
  }
});
stepBtn.addEventListener("click", () => {
  timeline.pause();
  playBtn.textContent = "Play";
  timeline.forward();
});
backBtn.addEventListener("click", () => {
  playBtn.textContent = "Play";
  timeline.back();
});
scrub.addEventListener("input", () => {
  timeline.pause();
  playBtn.textContent = "Play";
  timeline.seek(Number(scrub.value));
});
resetBtn.addEventListener("click", rebuild);
algoSelect.addEventListener("change", rebuild);
speedInput.addEventListener("input", () => timeline.setSpeed(speedToDelay()));
compareBtn.addEventListener("click", compareAll);

clearBtn.addEventListener("click", () => {
  for (const row of grid.cost) row.fill(1);
  compareEl.replaceChildren();
  rebuild();
});
randomBtn.addEventListener("click", () => {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const isEnd = same([r, c], start) || same([r, c], end);
      grid.cost[r][c] = !isEnd && Math.random() < 0.28 ? WALL : 1;
    }
  }
  rebuild();
});

bindShortcuts({ play: playBtn, step: stepBtn, back: backBtn, reset: resetBtn });

// --- init ---
pathAlgorithms.forEach((a) => algoSelect.add(new Option(a.name)));
rebuild();