import type { TNode, TreeStep } from "./types";

export const treeHeight = (n: TNode | null): number =>
  n ? 1 + Math.max(treeHeight(n.left), treeHeight(n.right)) : 0;
export const countNodes = (n: TNode | null): number =>
  n ? 1 + countNodes(n.left) + countNodes(n.right) : 0;

const COLORS = {
  node: "#1e293b",
  stroke: "#64748b",
  active: "#facc15",
  other: "#f97316",
  done: "#22c55e",
  edge: "#475569",
};

export class TreeRenderer {
  constructor(private canvas: HTMLCanvasElement) {}

  draw(root: TNode | null, step: TreeStep | null, showBalance: boolean) {
    const ctx = this.canvas.getContext("2d")!;
    const { width, height } = this.canvas;
    ctx.clearRect(0, 0, width, height);
    ctx.textAlign = "center";

    if (root === null) {
      ctx.fillStyle = "#64748b";
      ctx.font = "16px system-ui";
      ctx.fillText("Empty tree. Insert a number to start.", width / 2, height / 2);
      return;
    }

    const count = countNodes(root);
    const depth = treeHeight(root);
    const levelH = depth > 1 ? Math.min(80, (height - 90) / (depth - 1)) : 0;
    const radius = Math.max(9, Math.min(20, width / count / 2 - 2));

    // in-order index gives x, depth gives y
    const pos = new Map<number, { x: number; y: number; node: TNode }>();
    let idx = 0;
    const place = (n: TNode | null, d: number) => {
      if (n === null) return;
      place(n.left, d + 1);
      pos.set(n.key, { x: ((idx++ + 0.5) / count) * width, y: 40 + d * levelH, node: n });
      place(n.right, d + 1);
    };
    place(root, 0);

    ctx.strokeStyle = COLORS.edge;
    ctx.lineWidth = 2;
    for (const { x, y, node } of pos.values()) {
      for (const child of [node.left, node.right]) {
        if (!child) continue;
        const c = pos.get(child.key)!;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(c.x, c.y);
        ctx.stroke();
      }
    }

    ctx.font = `${radius >= 14 ? 13 : 10}px system-ui`;
    for (const [key, { x, y, node }] of pos) {
      let fill = COLORS.node;
      let text = "#e2e8f0";
      if (step?.done.includes(key)) { fill = COLORS.done; text = "#052e16"; }
      if (step?.other.includes(key)) { fill = COLORS.other; text = "#431407"; }
      if (step?.active.includes(key)) { fill = COLORS.active; text = "#422006"; }

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = COLORS.stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = text;
      ctx.fillText(String(key), x, y + 4);

      if (showBalance && radius >= 12) {
        const bf = treeHeight(node.left) - treeHeight(node.right);
        ctx.fillStyle = Math.abs(bf) > 1 ? "#f87171" : "#94a3b8";
        ctx.font = "10px system-ui";
        ctx.fillText(`bf ${bf > 0 ? "+" : ""}${bf}`, x, y + radius + 12);
        ctx.font = `${radius >= 14 ? 13 : 10}px system-ui`;
      }
    }
  }
}