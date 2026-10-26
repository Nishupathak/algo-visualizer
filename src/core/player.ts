export class Player<TStep> {
  private gen: Generator<TStep, void, undefined> | null = null;
  private timer: number | null = null;
  private delayMs = 100;

  constructor(
    private factory: () => Generator<TStep, void, undefined>,
    private onStep: (step: TStep) => void,
    private onDone: () => void,
  ) {}

  get isPlaying(): boolean {
    return this.timer !== null;
  }

  reset() {
    this.pause();
    this.gen = this.factory();
  }

  setSpeed(delayMs: number) {
    this.delayMs = delayMs;
    if (this.timer !== null) {
      this.pause();
      this.play();
    }
  }

  stepOnce(): boolean {
    this.gen ??= this.factory();
    const { value, done } = this.gen.next();
    if (done) {
      this.pause();
      this.onDone();
      return false;
    }
    this.onStep(value);
    return true;
  }

  play() {
    if (this.timer !== null) return;
    this.timer = window.setInterval(() => this.stepOnce(), this.delayMs);
  }

  pause() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}