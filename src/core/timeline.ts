export class Timeline<TStep> {
  private steps: TStep[] = [];
  private pos = 0;
  private timer: number | null = null;
  private delayMs = 100;

  constructor(private onChange: (pos: number, prev: number) => void) {}

  get length() { return this.steps.length; }
  get position() { return this.pos; }
  get isPlaying() { return this.timer !== null; }
  get atEnd() { return this.pos >= this.steps.length; }

  stepAt(i: number): TStep { return this.steps[i]; }
  upTo(pos: number): TStep[] { return this.steps.slice(0, pos); }

  load(steps: TStep[]) {
    this.pause();
    this.steps = steps;
    this.pos = 0;
    this.onChange(0, -1);
  }

  seek(target: number) {
    const next = Math.max(0, Math.min(this.steps.length, target));
    const prev = this.pos;
    this.pos = next;
    this.onChange(next, prev);
  }

  forward() {
    if (this.atEnd) { this.pause(); return; }
    if (this.pos + 1 >= this.steps.length) this.pause();
    this.seek(this.pos + 1);
  }

  back() {
    this.pause();
    this.seek(this.pos - 1);
  }

  play() {
    if (this.atEnd) this.seek(0);
    if (this.timer !== null) return;
    this.timer = window.setInterval(() => this.forward(), this.delayMs);
  }

  pause() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  setSpeed(delayMs: number) {
    this.delayMs = delayMs;
    if (this.timer !== null) {
      this.pause();
      this.play();
    }
  }
}