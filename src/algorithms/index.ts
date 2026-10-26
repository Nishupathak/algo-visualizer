import type { SortAlgorithm } from "../core/types";
import { bubbleSort } from "./sorting/bubbleSort";
import { insertionSort } from "./sorting/insertionSort";
import { selectionSort } from "./sorting/selectionSort";
import { mergeSort } from "./sorting/mergeSort";
import { quickSort } from "./sorting/quickSort";
import { heapSort } from "./sorting/heapSort";

export const sortAlgorithms: SortAlgorithm[] = [
  bubbleSort,
  insertionSort,
  selectionSort,
  mergeSort,
  quickSort,
  heapSort,
];