import "./style.css";
import { Timeline } from "./core/timeline";
import type { SortAlgorithm, SortStep } from "./core/types";
import { sortAlgorithms } from "./algorithms";
import { createCustomAlgorithm, STARTER_CODE, type CustomAlgorithm } from "./algorithms/custom";
import { SortRenderer } from "./ui/renderer";

const $ = <T extends HTMLElement>(id: string) =>
  document.getElementById(id) as T;

const canvas = $<HTMLCanvasElement>("canvas");
const algoSelect = $<HTMLSelectElement>("algo");
const presetSelect = $<HTMLSelectElement>("preset");
const backBtn = $<HTMLButtonElement>("back");
const playBtn = $<HTMLButtonElement>("play");
const stepBtn = $<HTMLButtonElement>("step");
const resetBtn = $<HTMLButtonElement>("reset");
const genBtn = $<HTMLButtonElement>("generate");
const compareBtn = $<HTMLButtonElement>("compare");
const speedInput = $<HTMLInputElement>("speed");
const sizeInput = $<HTMLInputElement>("size");
const scrub = $<HTMLInputElement>("scrub");
const customInput = $<HTMLInputElement>("custom");
const useBtn = $<HTMLButtonElement>("use-custom");
const errorEl = $<HTMLSpanElement>("error");
const statsEl = $<HTMLDivElement>("stats");
const metaEl = $<HTMLDivElement>("meta");
const codeEl = $<HTMLPreElement>("code");
const explainEl = $<HTMLDivElement>("explain");
const compareEl = $<HTMLDivElement>("compare-result");
const codeInput = $<HTMLTextAreaElement>("code-input");
const runCustomBtn = $<HTMLButtonElement>("run-custom");
const starterBtn = $<HTMLButtonElement>("load-starter");
const customMsg = $<HTMLDivElement>("custom-msg");

const MAX_STEPS = 50000;
const renderer = new SortRenderer(canvas);
let data: number[] = [];
let custom: CustomAlgorithm | null = null;
let finishedSorted = true; // false when a custom algorithm leaves the array unsorted

type Preset = "random" | "sorted" | "reversed" | "nearly" | "duplicates";

const speedToDelay = () => 201 - Number(speedInput.value);
const algoList = (): SortAlgorithm[] => (custom ? [...sortAlgorithms, custom] : sortAlgorithms);
const currentAlgo = (): SortAlgorithm => algoList()[algoSelect.selectedIndex];

function record(algo: SortAlgorithm, input: number[]): SortStep[] {
  const steps: SortStep[] = [];
  for (const s of algo.run(input)) {
    steps.push(s);
    if (steps.length >= MAX_STEPS) break;
  }
  return steps;
}

function makeArray(preset: Preset, n: number): number[] {
  const rand = () => Math.floor(Math.random() * 100) + 1;
  switch (preset) {
    case "random":
      return Array.from({ length: n }, rand);
    case "sorted":
      return Array.from({ length: n }, (_, i) => Math.round(((i + 1) / n) * 100));
    case "reversed":
      return makeArray("sorted", n).reverse();
    case "nearly": {
      const a = makeArray("sorted", n);
      const swaps = Math.max(1, Math.floor(n / 10));
      for (let k = 0; k < swaps; k++) {
        const i = Math.floor(Math.random() * n);
        const j = Math.floor(Math.random() * n);
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }
    case "duplicates":
      return Array.from({ length: n }, () => (Math.floor(Math.random() * 4) + 1) * 25);
  }
}

function parseCustom(raw: string): number[] | string {
  const parts = raw.split(/[\s,]+/).filter(Boolean);
  if (parts.length < 2) return "Enter at least 2 numbers.";
  if (parts.length > 100) return "Maximum 100 numbers.";
  const nums = parts.map(Number);
  if (nums.some((x) => !Number.isFinite(x))) return "Use only numbers, separated by commas or spaces.";
  return nums;
}

function renderCode(activeLine = -1) {
  const lines = currentAlgo().code.map((text, i) => {
    const div = document.createElement("div");
    div.className = "line" + (i === activeLine ? " active" : "");
    div.textContent = text;
    return div;
  });
  codeEl.replaceChildren(...lines);
}

function showMeta() {
  const { name, best, average, worst, space } = currentAlgo().meta;
  metaEl.textContent = `${name} — Best: ${best} · Avg: ${average} · Worst: ${worst} · Space: ${space}`;
}

function setMsg(text: string, kind: "ok" | "bad" | "") {
  customMsg.textContent = text;
  customMsg.className = kind;
}

const timeline = new Timeline<SortStep>((pos, prev) => {
  const len = timeline.length;

  if (pos === prev + 1 && pos > 0) renderer.apply(timeline.stepAt(pos - 1));
  else renderer.replay(timeline.upTo(pos));
  if (pos === len && len > 0 && finishedSorted) renderer.markAllSorted();

  scrub.max = String(len);
  scrub.value = String(pos);
  statsEl.textContent =
    `Step ${pos}/${len} | Comparisons: ${renderer.comparisons} | Swaps/writes: ${renderer.swaps}`;

  if (pos > 0 && pos < len) {
    const s = timeline.stepAt(pos - 1);
    renderCode(s.line);
    explainEl.textContent = s.explain;
  } else {
    renderCode();
    if (pos === 0) explainEl.textContent = "Press Play or Step to begin.";
    else explainEl.textContent = finishedSorted ? "Done. The array is sorted." : "Done, but the array is NOT sorted. See the message below.";
  }
  if (!timeline.isPlaying) playBtn.textContent = "Play";
});

function load() {
  renderer.setData(data);
  showMeta();
  timeline.setSpeed(speedToDelay());

  const algo = currentAlgo();
  const steps = record(algo, data);
  finishedSorted = true;

  if (algo === custom && custom) {
    const expected = [...data].sort((a, b) => a - b);
    const result = custom.lastResult ?? [];
    const sorted = result.length === expected.length && result.every((v, i) => v === expected[i]);
    const comparisons = steps.filter((s) => s.type === "compare").length;
    const writes = steps.length - comparisons;
    if (custom.lastError) {
      finishedSorted = false;
      setMsg(`${custom.lastError}\nThe steps before the error are shown so you can see where it broke.`, "bad");
    } else if (!sorted) {
      finishedSorted = false;
      setMsg(`Your code finished, but the array is NOT sorted.\nExpected: [${expected.join(", ")}]\nGot:      [${result.join(", ")}]\nStep through it to find where it goes wrong.`, "bad");
    } else {
      setMsg(`Sorted correctly. ${comparisons} comparisons, ${writes} swaps/writes.`, "ok");
    }
  } else {
    setMsg("", "");
  }
  timeline.load(steps);
}

function newArray() {
  errorEl.textContent = "";
  data = makeArray(presetSelect.value as Preset, Number(sizeInput.value));
  load();
}

function showComparison() {
  const rows = sortAlgorithms.map((algo) => {
    const steps = record(algo, data);
    const comparisons = steps.filter((s) => s.type === "compare").length;
    const writes = steps.filter((s) => s.type === "swap" || s.type === "overwrite").length;
    return { name: algo.meta.name, worst: algo.meta.worst, comparisons, writes };
  });
  const best = Math.min(...rows.map((r) => r.comparisons));
  const body = rows
    .map(
      (r) =>
        `<tr class="${r.comparisons === best ? "best" : ""}"><td>${r.name}</td><td>${r.comparisons}</td><td>${r.writes}</td><td>${r.worst}</td></tr>`,
    )
    .join("");
  compareEl.innerHTML =
    `<h2>Same array (n = ${data.length}), every built-in algorithm</h2>` +
    `<table><thead><tr><th>Algorithm</th><th>Comparisons</th><th>Swaps/writes</th><th>Worst case</th></tr></thead><tbody>${body}</tbody></table>`;
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
resetBtn.addEventListener("click", load);
genBtn.addEventListener("click", newArray);
sizeInput.addEventListener("input", newArray);
presetSelect.addEventListener("change", newArray);
speedInput.addEventListener("input", () => timeline.setSpeed(speedToDelay()));
algoSelect.addEventListener("change", load);
compareBtn.addEventListener("click", showComparison);

useBtn.addEventListener("click", () => {
  const result = parseCustom(customInput.value);
  if (typeof result === "string") {
    errorEl.textContent = result;
    return;
  }
  errorEl.textContent = "";
  data = result;
  load();
});

runCustomBtn.addEventListener("click", () => {
  custom = createCustomAlgorithm(codeInput.value);
  if (algoSelect.options.length === sortAlgorithms.length) {
    algoSelect.add(new Option("★ Your algorithm"));
  }
  algoSelect.selectedIndex = sortAlgorithms.length;
  load();
});
starterBtn.addEventListener("click", () => {
  codeInput.value = STARTER_CODE;
});

// --- init ---
sortAlgorithms.forEach((a) => algoSelect.add(new Option(a.meta.name)));
codeInput.value = STARTER_CODE;
newArray();