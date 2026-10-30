<div align="center">

# Algorithm Visualizer

**Algorithms you can rewind, break and race.**

Sorting, pathfinding and self-balancing trees, built from scratch in TypeScript with no UI framework.

![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-build-646cff?logo=vite&logoColor=white)


</div>

---

## Why this exists

Most visualizers play an animation and that's it. This one is built for understanding and debugging:

- **Rewind.** Step backward or drag the timeline to any moment.
- **See the code.** The line that is running is highlighted, and every step is explained in plain English.
- **Use your own data.** Paste any numbers, or pick presets like reversed, nearly sorted or many duplicates.
- **Break things on purpose.** Write your own sort and watch exactly where it goes wrong.

## Screenshots

### Sorting
![Sorting](<img width="1183" height="671" alt="6278229137570862007" src="https://github.com/user-attachments/assets/31c2d264-faeb-4127-a39f-4b946242b62d" />)

Six algorithms with a live code panel, step explanations, comparison and swap counters, and a "Compare all" table that runs every algorithm on the same array.

### Pathfinding
![Pathfinding](<img width="1114" height="669" alt="6278229137570862009" src="https://github.com/user-attachments/assets/eecf2176-a680-457b-8cba-5f2c18c6ae4b" />)

Draw walls and weighted "mud" cells, drag the start and goal, and watch BFS, DFS, Dijkstra and A* explore the same board.

### Trees
![Trees](<img width="1106" height="664" alt="6278229137570862010" src="https://github.com/user-attachments/assets/b076fe16-4426-4661-b95b-fc1153b879c2" />)

BST and AVL trees with balance factors on every node and step-by-step rotations.

## Features

### Sorting
- Bubble, Insertion, Selection, Merge, Quick and Heap sort
- Custom input (up to 100 numbers) and presets for best and worst cases
- **Compare all:** comparisons and writes for every algorithm on the same input
- **Bring your own algorithm:** write a sort in JavaScript using `compare(i, j)`, `swap(i, j)` and `set(i, value)`. The app animates it and tells you whether the result is actually sorted, showing expected vs. actual output if not
- **Share links:** the array and algorithm are encoded in the URL

### Pathfinding
- BFS, DFS, Dijkstra and A* on a 50 x 25 grid
- Walls and weighted cells (cost 5), so you can see why BFS is not enough on weighted graphs
- Drag the start and goal, and the run recomputes live
- **Compare all:** cells visited, path length and path cost per algorithm
- Dijkstra and A* use a **hand-written binary min-heap**

### Trees
- Plain BST and AVL tree
- Insert, delete (leaf, one child, two children via in-order successor) and search
- Pre-order, in-order, post-order and level-order traversals
- AVL rotations shown one at a time: Left-Left, Right-Right, Left-Right and Right-Left
- One-click demo: insert 1 to 10 in order, and watch a plain BST become a chain while AVL stays balanced

### Everywhere
- Keyboard shortcuts: `Space` play/pause, `←` `→` step, `R` reset
- Sharp rendering on high-DPI screens and a responsive layout

## Complexity reference

| Sort | Best | Average | Worst | Space |
|---|---|---|---|---|
| Bubble | O(n) | O(n²) | O(n²) | O(1) |
| Insertion | O(n) | O(n²) | O(n²) | O(1) |
| Selection | O(n²) | O(n²) | O(n²) | O(1) |
| Merge | O(n log n) | O(n log n) | O(n log n) | O(n) |
| Quick | O(n log n) | O(n log n) | O(n²) | O(log n) |
| Heap | O(n log n) | O(n log n) | O(n log n) | O(1) |

| Pathfinding | Data structure | Cheapest path on weighted grid |
|---|---|---|
| BFS | Queue | No (fewest steps only) |
| DFS | Stack | No |
| Dijkstra | Min-heap | Yes |
| A* | Min-heap + Manhattan heuristic | Yes |

AVL insert, delete and search are O(log n). A plain BST degrades to O(n) on sorted input.

## How it works

Every algorithm is a **generator** that yields typed steps. The UI never touches algorithm code.

```
algorithm (generator)  ->  Step[]  ->  Timeline  ->  renderer
```

- Steps are recorded up front, so rewinding and scrubbing are just index changes.
- `SortStep`, `GridStep` and `TreeStep` are discriminated unions, and the sort renderer uses an exhaustive `switch`.
- Tree steps carry a snapshot of the whole tree, so any step can be drawn independently.
- One `Timeline` class powers all three pages.

## Testing

Tests replay each algorithm's steps and check the result against a reference:

- All six sorts against `Array.prototype.sort`, including empty, single, duplicate, negative and reversed inputs
- Dijkstra vs. A* vs. BFS on random weighted grids (equal cost for Dijkstra and A*, never worse than BFS)
- AVL checked against a `Set` over 400 random inserts and deletes, verifying balance and stored heights after every operation
- All four tree traversals, the min-heap, and the custom-algorithm sandbox's error handling

## Project structure

```
src/
  algorithms/    sorting algorithms and the custom-code runner
  pathfinding/   grid algorithms, renderer, page logic
  tree/          BST/AVL implementation, renderer, page logic
  core/          Timeline, MinHeap, canvas and keyboard helpers
  tests/         Vitest suites
```

## Run locally

```bash
git clone https://github.com/Nishupathak/algo-visualizer.git
cd algo-visualizer
npm install
npm run dev      # start the dev server
npm test         # run the tests
npm run build    # type-check and build for production
```

## Known limitations

- "Bring your own algorithm" runs your code in the page. Loops that call `compare`, `swap` or `set` are stopped after 20,000 steps, but a loop that never calls them can freeze the tab. Moving it into a Web Worker is the next improvement.
- Sorting supports up to 100 numbers. Share links currently exist on the sorting page only.

## Roadmap

- [ ] Run custom code in a Web Worker
- [ ] Graph algorithms: topological sort, union-find, minimum spanning tree
- [ ] Maze generation on the pathfinding page
- [ ] Dynamic programming visualizer

## Tech

TypeScript, Vite, Vitest, HTML Canvas, GitHub Actions, GitHub Pages.
