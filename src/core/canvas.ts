export function prepare(canvas: HTMLCanvasElement) {
  const width = Number(canvas.dataset.w ?? canvas.width);
  const height = Number(canvas.dataset.h ?? canvas.height);
  canvas.dataset.w = String(width);
  canvas.dataset.h = String(height);

  const dpr = window.devicePixelRatio || 1;
  if (canvas.width !== Math.round(width * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width, height };
}