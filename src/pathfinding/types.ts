export type Cell = [number, number]; // [row, col]

export const WALL = -1;
export const WEIGHT = 5; // "mud": costs 5 to enter, normal cells cost 1

export interface Grid {
  rows: number;
  cols: number;
  cost: number[][]; // WALL, 1, or WEIGHT
}

interface Base {
  explain: string;
}
export interface OpenStep extends Base { type: "open"; cell: Cell }
export interface VisitStep extends Base { type: "visit"; cell: Cell }
export interface PathStep extends Base { type: "path"; cells: Cell[] }
export interface NoneStep extends Base { type: "none" }

export type GridStep = OpenStep | VisitStep | PathStep | NoneStep;