export interface TNode {
  key: number;
  left: TNode | null;
  right: TNode | null;
  height: number;
}

export type Order = "inorder" | "preorder" | "postorder" | "level";

export interface TreeStep {
  explain: string;
  tree: TNode | null; // snapshot of the whole tree at this step
  active: number[];   // yellow: node being looked at
  other: number[];    // orange: secondary node (successor, unbalanced node)
  done: number[];     // green: found / already visited
  rotation: boolean;
}

export function cloneTree(n: TNode | null): TNode | null {
  return n
    ? { key: n.key, height: n.height, left: cloneTree(n.left), right: cloneTree(n.right) }
    : null;
}