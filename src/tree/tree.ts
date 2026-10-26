import { cloneTree, type Order, type TNode, type TreeStep } from "./types";

type Gen = Generator<TreeStep, void, undefined>;

const h = (n: TNode | null) => (n ? n.height : 0);
const update = (n: TNode) => {
  n.height = 1 + Math.max(h(n.left), h(n.right));
};
const balance = (n: TNode) => h(n.left) - h(n.right);
const makeNode = (key: number): TNode => ({ key, left: null, right: null, height: 1 });

const NAMES: Record<Order, string> = {
  inorder: "In-order",
  preorder: "Pre-order",
  postorder: "Post-order",
  level: "Level-order",
};

export class Tree {
  root: TNode | null = null;

  constructor(readonly avl: boolean) {}

  private step(
    explain: string,
    active: number[] = [],
    other: number[] = [],
    done: number[] = [],
    rotation = false,
  ): TreeStep {
    return { explain, tree: cloneTree(this.root), active, other, done, rotation };
  }

  private replaceChild(parent: TNode | null, old: TNode, next: TNode | null) {
    if (parent === null) this.root = next;
    else if (parent.left === old) parent.left = next;
    else parent.right = next;
  }

  private rotateRight(y: TNode, parent: TNode | null): TNode {
    const x = y.left as TNode;
    y.left = x.right;
    x.right = y;
    update(y);
    update(x);
    this.replaceChild(parent, y, x);
    return x;
  }

  private rotateLeft(x: TNode, parent: TNode | null): TNode {
    const y = x.right as TNode;
    x.right = y.left;
    y.left = x;
    update(x);
    update(y);
    this.replaceChild(parent, x, y);
    return y;
  }

  /** Walk back up the path: fix heights, and in AVL mode rotate where needed. */
  private *rebalance(path: TNode[]): Gen {
    for (let i = path.length - 1; i >= 0; i--) {
      const n = path[i];
      const parent = i > 0 ? path[i - 1] : null;
      update(n);
      const b = balance(n);
      if (!this.avl || Math.abs(b) <= 1) continue;

      const sign = b > 0 ? "+" : "";
      yield this.step(`Node ${n.key} is unbalanced (balance factor ${sign}${b}). Rotate to fix it.`, [], [n.key]);

      if (b > 1) {
        const l = n.left as TNode;
        if (balance(l) < 0) {
          yield this.step(`Left-Right case: first rotate ${l.key} to the left.`, [], [n.key]);
          const mid = this.rotateLeft(l, n);
          yield this.step(`Rotated left. ${mid.key} is now ${n.key}'s left child.`, [mid.key], [n.key], [], true);
        } else {
          yield this.step(`Left-Left case: one right rotation is enough.`, [], [n.key]);
        }
        const top = this.rotateRight(n, parent);
        yield this.step(`Rotate ${n.key} to the right. ${top.key} becomes the root of this subtree.`, [top.key], [], [], true);
      } else {
        const r = n.right as TNode;
        if (balance(r) > 0) {
          yield this.step(`Right-Left case: first rotate ${r.key} to the right.`, [], [n.key]);
          const mid = this.rotateRight(r, n);
          yield this.step(`Rotated right. ${mid.key} is now ${n.key}'s right child.`, [mid.key], [n.key], [], true);
        } else {
          yield this.step(`Right-Right case: one left rotation is enough.`, [], [n.key]);
        }
        const top = this.rotateLeft(n, parent);
        yield this.step(`Rotate ${n.key} to the left. ${top.key} becomes the root of this subtree.`, [top.key], [], [], true);
      }
    }
  }

  *insert(key: number): Gen {
    if (this.root === null) {
      this.root = makeNode(key);
      yield this.step(`The tree is empty, so ${key} becomes the root.`, [key]);
      return;
    }
    const path: TNode[] = [];
    let cur: TNode | null = this.root;
    while (cur !== null) {
      path.push(cur);
      if (key === cur.key) {
        yield this.step(`${key} is already in the tree. Duplicates are ignored.`, [cur.key]);
        return;
      }
      const goLeft = key < cur.key;
      yield this.step(
        `Compare ${key} with ${cur.key}: ${key} is ${goLeft ? "smaller, go left" : "larger, go right"}.`,
        [cur.key],
      );
      cur = goLeft ? cur.left : cur.right;
    }
    const parent = path[path.length - 1];
    const created = makeNode(key);
    const left = key < parent.key;
    if (left) parent.left = created;
    else parent.right = created;
    yield this.step(`Empty spot found. Place ${key} as the ${left ? "left" : "right"} child of ${parent.key}.`, [key]);
    yield* this.rebalance(path);
  }

  *remove(key: number): Gen {
    const path: TNode[] = [];
    let cur: TNode | null = this.root;
    while (cur !== null && cur.key !== key) {
      path.push(cur);
      const goLeft = key < cur.key;
      yield this.step(
        `Compare ${key} with ${cur.key}: ${key} is ${goLeft ? "smaller, go left" : "larger, go right"}.`,
        [cur.key],
      );
      cur = goLeft ? cur.left : cur.right;
    }
    if (cur === null) {
      yield this.step(`${key} is not in the tree, so there is nothing to delete.`);
      return;
    }
    yield this.step(`Found ${key}.`, [key]);

    const { left, right } = cur;
    if (left && right) {
      yield this.step(
        `${key} has two children. Replace it with its in-order successor: the smallest node in its right subtree.`,
        [key],
      );
      path.push(cur);
      let succ: TNode = right;
      while (succ.left) {
        yield this.step(`${succ.key} has a left child, so keep going left.`, [key], [succ.key]);
        path.push(succ);
        succ = succ.left;
      }
      yield this.step(`The successor is ${succ.key}. Copy it into the node that held ${key}, then remove the successor.`, [key], [succ.key]);
      const succParent = path[path.length - 1];
      cur.key = succ.key;
      this.replaceChild(succParent, succ, succ.right);
      yield this.step(`Removed the old successor node. ${cur.key} now sits where ${key} was.`, [cur.key]);
    } else {
      const child = left ?? right;
      const parent = path.length > 0 ? path[path.length - 1] : null;
      this.replaceChild(parent, cur, child);
      yield this.step(
        child ? `${key} has one child, so ${child.key} takes its place.` : `${key} is a leaf, so simply remove it.`,
        child ? [child.key] : [],
      );
    }
    yield* this.rebalance(path);
  }

  *search(key: number): Gen {
    let cur = this.root;
    while (cur !== null) {
      if (key === cur.key) {
        yield this.step(`Found ${key}.`, [], [], [key]);
        return;
      }
      const goLeft = key < cur.key;
      yield this.step(
        `Compare ${key} with ${cur.key}: ${key} is ${goLeft ? "smaller, go left" : "larger, go right"}.`,
        [cur.key],
      );
      cur = goLeft ? cur.left : cur.right;
    }
    yield this.step(`Reached an empty spot, so ${key} is not in the tree.`);
  }

  *traverse(order: Order): Gen {
    if (this.root === null) {
      yield this.step("The tree is empty. Insert some numbers first.");
      return;
    }
    const out: number[] = [];
    if (order === "level") {
      const queue: TNode[] = [this.root];
      let head = 0;
      while (head < queue.length) {
        const n = queue[head++];
        out.push(n.key);
        yield this.step(`Take ${n.key} from the front of the queue and visit it. Output: ${out.join(", ")}`, [n.key], [], [...out]);
        if (n.left) queue.push(n.left);
        if (n.right) queue.push(n.right);
      }
    } else {
      yield* this.walk(this.root, order, out);
    }
    yield this.step(
      `Done. ${NAMES[order]} output: ${out.join(", ")}` +
        (order === "inorder" ? ". In-order on a BST is always sorted." : "."),
      [],
      [],
      [...out],
    );
  }

  private *walk(n: TNode | null, order: Order, out: number[]): Gen {
    if (n === null) return;
    const visit = function* (self: Tree): Gen {
      out.push(n.key);
      yield self.step(`Visit ${n.key}. Output: ${out.join(", ")}`, [n.key], [], [...out]);
    };
    if (order === "preorder") yield* visit(this);
    yield* this.walk(n.left, order, out);
    if (order === "inorder") yield* visit(this);
    yield* this.walk(n.right, order, out);
    if (order === "postorder") yield* visit(this);
  }
}