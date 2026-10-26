export class MinHeap<T> {
  private a: T[] = [];

  constructor(private less: (x: T, y: T) => boolean) {}

  get size(): number {
    return this.a.length;
  }

  push(v: T): void {
    this.a.push(v);
    let i = this.a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!this.less(this.a[i], this.a[p])) break;
      [this.a[i], this.a[p]] = [this.a[p], this.a[i]];
      i = p;
    }
  }

  pop(): T | undefined {
    if (this.a.length === 0) return undefined;
    const top = this.a[0];
    const last = this.a.pop() as T;
    const n = this.a.length;
    if (n > 0) {
      this.a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < n && this.less(this.a[l], this.a[m])) m = l;
        if (r < n && this.less(this.a[r], this.a[m])) m = r;
        if (m === i) break;
        [this.a[i], this.a[m]] = [this.a[m], this.a[i]];
        i = m;
      }
    }
    return top;
  }
}