import "../style.css";
import { Timeline } from "../core/timeline";
import { bindShortcuts } from "../core/shortcuts";
import { Tree } from "./tree";
import { TreeRenderer, countNodes, treeHeight } from "./renderer";
import { cloneTree, type Order, type TNode, type TreeStep } from "./types";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const canvas = $<HTMLCanvasElement>("canvas");
const modeSelect = $<HTMLSelectElement>("mode");
const orderSelect = $<HTMLSelectElement>("order");
const keyInput = $<HTMLInputElement>("key");
const errorEl = $<HTMLSpanElement>("error");
const insertBtn = $<HTMLButtonElement>("insert");
const deleteBtn = $<HTMLButtonElement>("delete");
const searchBtn = $<HTMLButtonElement>("search");
const traverseBtn = $<HTMLButtonElement>("traverse");
const backBtn = $<HTMLButtonElement>("back");
const playBtn = $<HTMLButtonElement>("play");
const stepBtn = $<HTMLButtonElement>("step");
const resetBtn = $<HTMLButtonElement>("reset");
const randomBtn = $<HTMLButtonElement>("random");
const sequenceBtn = $<HTMLButtonElement>("sequence");
const clearBtn = $<HTMLButtonElement>("clear");
const speedInput = $<HTMLInputElement>("speed");
const scrub = $<HTMLInputElement>("scrub");
const explainEl = $<HTMLDivElement>("explain");
const statsEl = $<HTMLDivElement>("stats");

const renderer = new TreeRenderer(canvas);
let tree = new Tree(false);
let before: TNode | null = null;
let hint = "Type a number and click Insert.";

const speedToDelay = () => 201 - Number(speedInput.value);

const timeline = new Timeline<TreeStep>((pos) => {
  const shown = pos > 0 ? timeline.stepAt(pos - 1) : null;
  const root = shown ? shown.tree : before;
  renderer.draw(root, shown, tree.avl);

  scrub.max = String(timeline.length);
  scrub.value = String(pos);

  const rotations = timeline.upTo(pos).filter((s) => s.rotation).length;
  statsEl.textContent =
    `Step ${pos}/${timeline.length} | Nodes: ${countNodes(root)} | Height: ${treeHeight(root)}` +
    (tree.avl ? ` | Rotations in this operation: ${rotations}` : "");
  explainEl.textContent = shown ? shown.explain : hint;
  if (!timeline.isPlaying) playBtn.textContent = "Play";
});

function run(gen: Generator<TreeStep, void, undefined>) {
  before = cloneTree(tree.root);
  const steps = [...gen];
  timeline.setSpeed(speedToDelay());
  timeline.load(steps);
  timeline.play();
  playBtn.textContent = "Pause";
}

function drain(gen: Generator<TreeStep, void, undefined>) {
  let r = gen.next();
  while (!r.done) r = gen.next();
}

function showInstantly(message: string) {
  before = cloneTree(tree.root);
  hint = message;
  timeline.load([]);
}

function startFresh(avl: boolean) {
  tree = new Tree(avl);
  before = null;
  hint = "Type a number and click Insert.";
  errorEl.textContent = "";
  timeline.load([]);
}

function readKey(): number | null {
  const raw = keyInput.value.trim();
  const k = Number(raw);
  if (raw === "" || !Number.isInteger(k) || Math.abs(k) > 999) {
    errorEl.textContent = "Enter a whole number between -999 and 999.";
    return null;
  }
  errorEl.textContent = "";
  return k;
}

function withKey(action: (k: number) => Generator<TreeStep, void, undefined>) {
  const k = readKey();
  if (k === null) return;
  run(action(k));
  keyInput.value = "";
  keyInput.focus();
}

insertBtn.addEventListener("click", () => withKey((k) => tree.insert(k)));
deleteBtn.addEventListener("click", () => withKey((k) => tree.remove(k)));
searchBtn.addEventListener("click", () => withKey((k) => tree.search(k)));
traverseBtn.addEventListener("click", () => run(tree.traverse(orderSelect.value as Order)));
keyInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") withKey((k) => tree.insert(k));
});

modeSelect.addEventListener("change", () => startFresh(modeSelect.value === "avl"));
clearBtn.addEventListener("click", () => startFresh(modeSelect.value === "avl"));

randomBtn.addEventListener("click", () => {
  tree = new Tree(modeSelect.value === "avl");
  const keys = new Set<number>();
  while (keys.size < 10) keys.add(Math.floor(Math.random() * 99) + 1);
  for (const k of keys) drain(tree.insert(k));
  showInstantly("Random tree built. Insert, delete or search to watch it change.");
});

sequenceBtn.addEventListener("click", () => {
  tree = new Tree(modeSelect.value === "avl");
  for (let k = 1; k <= 10; k++) drain(tree.insert(k));
  showInstantly(
    tree.root && treeHeight(tree.root) > 5
      ? "Inserted 1 to 10 in order into a plain BST: it became a chain. Search is now O(n). Switch to AVL and try again."
      : "Inserted 1 to 10 in order into an AVL tree: rotations kept it balanced, so height stays near log n.",
  );
});

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
resetBtn.addEventListener("click", () => {
  timeline.pause();
  playBtn.textContent = "Play";
  timeline.seek(0);
});
scrub.addEventListener("input", () => {
  timeline.pause();
  playBtn.textContent = "Play";
  timeline.seek(Number(scrub.value));
});
speedInput.addEventListener("input", () => timeline.setSpeed(speedToDelay()));

bindShortcuts({ play: playBtn, step: stepBtn, back: backBtn, reset: resetBtn });

startFresh(false);