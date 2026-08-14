export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type Board = CellValue[][];

export interface CellPosition {
  row: number;
  col: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  minClues: number;
  maxClues: number;
}

export interface Puzzle {
  puzzle: Board;
  solution: Board;
  givens: boolean[][];
}

export interface LevelProgress {
  completed: boolean;
  bestScore: number;
}

export interface HistoryEntry {
  levelId: number;
  score: number;
  at: string;
}

export interface ProgressData {
  unlockedLevels: number[];
  levelProgress: Record<number, LevelProgress>;
  totalScore: number;
  history: HistoryEntry[];
}

export interface ActiveGame {
  levelId: number;
  board: Board;
  solution: Board;
  givens: boolean[][];
  score: number;
  hintsLeft: number;
}

export const HINTS_PER_LEVEL = 3;
export const HISTORY_LIMIT = 50;
