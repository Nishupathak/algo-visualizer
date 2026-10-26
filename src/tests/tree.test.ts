import { describe, it, expect } from "vitest";
import { Tree } from "../tree/tree";
import type { Order, TNode, TreeStep } from "../tree/types";

const drain = (g: Generator<TreeStep, void, undefined>) => [...g];
const inorder = (n: TNode | null): number[] => (n ? [...inorder(n.left), n.key, ...inorder(n.right)] : []);
const height = (n: TNode | null): number => (n ? 1 + Math.max(height(n.left), height(n.right)) : 0);
const balanced = (n: TNode | null): boolean =>
  n === null || (Math.abs(height(n.left) - height(n.right)) <= 1 && balanced(n.left) && balanced(n.right));
const heightsCorrect = (n: TNode | null): boolean =>
  n === null || (n.height === height(n) && heightsCorrect(n.left) && heightsCorrect(n.right));

function build(avl: boolean, keys: number[]) {
  const t = new Tree(avl);
  keys.forEach((k) => drain(t.insert(k)));
  return t;
}

describe("BST", () => {
  it("keeps keys sorted and ignores duplicates", () => {
    const t = build(false, [50, 30, 70, 20, 40, 60, 80, 30, 50]);
    expect(inorder(t.root)).toEqual([20, 30, 40, 50, 60, 70, 80]);
  });

  it("deletes leaf, one-child and two-child nodes", () => {
    const t = build(false, [50, 30, 70, 20, 40, 60, 80, 10]);
    drain(t.remove(10)); // leaf
    expect(inorder(t.root)).toEqual([20, 30, 40, 50, 60, 70, 80]);
    drain(t.remove(20)); // now a leaf; remove, then 30 has one child
    drain(t.remove(30)); // one child (40)
    expect(inorder(t.root)).toEqual([40, 50, 60, 70, 80]);
    drain(t.remove(50)); // two children (root)
    expect(inorder(t.root)).toEqual([40, 60, 70, 80]);
    expect(heightsCorrect(t.root)).toBe(true);
  });

  it("deleting a missing key changes nothing", () => {
    const t = build(false, [2, 1, 3]);
    drain(t.remove(99));
    expect(inorder(t.root)).toEqual([1, 2, 3]);
  });

  it("becomes a chain when keys arrive sorted", () => {
    const t = build(false, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(height(t.root)).toBe(10);
  });
});

describe("AVL", () => {
  it("stays balanced when keys arrive sorted", () => {
    const t = build(true, Array.from({ length: 100 }, (_, i) => i + 1));
    expect(balanced(t.root)).toBe(true);
    expect(height(t.root)).toBeLessThanOrEqual(8);
    expect(heightsCorrect(t.root)).toBe(true);
  });

  it("emits rotation steps", () => {
    const t = new Tree(true);
    const steps = [1, 2, 3].flatMap((k) => drain(t.insert(k)));
    expect(steps.some((s) => s.rotation)).toBe(true);
    expect(t.root?.key).toBe(2);
  });

  it("matches a Set and stays balanced over random inserts and deletes", () => {
    const t = new Tree(true);
    const model = new Set<number>();
    for (let i = 0; i < 400; i++) {
      const k = Math.floor(Math.random() * 60);
      if (Math.random() < 0.6) {
        drain(t.insert(k));
        model.add(k);
      } else {
        drain(t.remove(k));
        model.delete(k);
      }
      expect(inorder(t.root)).toEqual([...model].sort((a, b) => a - b));
      expect(balanced(t.root)).toBe(true);
      expect(heightsCorrect(t.root)).toBe(true);
    }
  });
});

describe("search and traversal", () => {
  const t = build(false, [50, 30, 70, 20, 40, 60, 80]);
  const result = (order: Order) => drain(t.traverse(order)).at(-1)!.done;

  it("search marks a found key", () => {
    expect(drain(t.search(60)).at(-1)!.done).toContain(60);
    expect(drain(t.search(61)).at(-1)!.done).toEqual([]);
  });

  it("produces the correct traversal orders", () => {
    expect(result("inorder")).toEqual([20, 30, 40, 50, 60, 70, 80]);
    expect(result("preorder")).toEqual([50, 30, 20, 40, 70, 60, 80]);
    expect(result("postorder")).toEqual([20, 40, 30, 60, 80, 70, 50]);
    expect(result("level")).toEqual([50, 30, 70, 20, 40, 60, 80]);
  });
});