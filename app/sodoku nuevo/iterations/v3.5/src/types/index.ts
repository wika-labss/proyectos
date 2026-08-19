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

/** Solo uso interno de generación — NUNCA mostrar al jugador */
export type InternalDifficulty = 'easy' | 'medium';

export type RewardName =
  | 'regalo 1'
  | 'regalo 2'
  | 'regalo 3'
  | 'regalo 4'
  | 'regalo 5'
  | 'regalo 6'
  | 'regalo 7'
  | 'regalo 8';

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
  reward?: RewardName;
}

export interface ProgressData {
  unlockedLevels: number[];
  levelProgress: Record<number, LevelProgress>;
  totalScore: number;
  history: HistoryEntry[];
  inventory: RewardName[];
  lastReward: RewardName | null;
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
export const REWARD_NAMES: RewardName[] = [
  'regalo 1',
  'regalo 2',
  'regalo 3',
  'regalo 4',
  'regalo 5',
  'regalo 6',
  'regalo 7',
  'regalo 8',
];
