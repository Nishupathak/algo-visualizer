import type { SortStep } from "../core/types";
import { prepare } from "../core/canvas";

type BarState = "default" | "compare" | "swap" | "sorted";

const COLORS: Record<BarState, string> = {
  default: "#64748b",
  compare: "#facc15",
  swap: "#ef4444",
  sorted: "#22c55e",
};

export class SortRenderer {
  private initial: number[] = [];
  private arr: number[] = [];
  private states: BarState[] = [];
  comparisons = 0;
  swaps = 0;

  constructor(private canvas: HTMLCanvasElement) {}

  setData(data: number[]) {
    this.initial = [...data];
    this.reset();
    this.draw();
  }

  apply(step: SortStep) {
    this.mutate(step);
    this.draw();
  }

  replay(steps: SortStep[]) {
    this.reset();
    for (const s of steps) this.mutate(s);
    this.draw();
  }

  markAllSorted() {
    this.states = this.states.map((): BarState => "sorted");
    this.draw();
  }

  private reset() {
    this.arr = [...this.initial];
    this.states = this.initial.map((): BarState => "default");
    this.comparisons = 0;
    this.swaps = 0;
  }

  private mutate(step: SortStep) {
    this.states = this.states.map((s): BarState => (s === "sorted" ? s : "default"));
    switch (step.type) {
      case "compare": {
        const [a, b] = step.indices;
        this.states[a] = "compare";
        this.states[b] = "compare";
        this.comparisons++;
        break;
      }
      case "swap": {
        const [a, b] = step.indices;
        [this.arr[a], this.arr[b]] = [this.arr[b], this.arr[a]];
        this.states[a] = "swap";
        this.states[b] = "swap";
        this.swaps++;
        break;
      }
      case "overwrite":
        this.arr[step.index] = step.value;
        this.states[step.index] = "swap";
        this.swaps++;
        break;
      case "sorted":
        this.states[step.index] = "sorted";
        break;
      default: {
        const _exhaustive: never = step;
        return _exhaustive;
      }
    }
  }

  private draw() {
    const { ctx, width, height } = prepare(this.canvas);
    ctx.clearRect(0, 0, width, height);

    const n = this.arr.length;
    if (n === 0) return;
    const min = Math.min(...this.arr);
    const max = Math.max(...this.arr);
    const range = max - min || 1;
    const barW = width / n;

    this.arr.forEach((v, i) => {
      const h = 20 + ((v - min) / range) * (height - 50);
      ctx.fillStyle = COLORS[this.states[i]];
      ctx.fillRect(i * barW + 1, height - h, barW - 2, h);
      if (barW > 22) {
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "12px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(String(v), i * barW + barW / 2, height - h - 4);
      }
    });
  }
}