export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type Board = CellValue[][];

export type Notes = Set<number>[][];

export interface CellPosition {
  row: number;
  col: number;
}

export type Difficulty = 'easy' | 'easy+' | 'medium' | 'hard' | 'expert';

export interface LevelConfig {
  id: number;
  name: string;
  difficulty: Difficulty;
  minClues: number;
  maxClues: number;
  maxHints: number;
}

export interface LevelProgress {
  completed: boolean;
  bestTime: number | null;
  stars: number;
}

export interface Puzzle {
  puzzle: Board;
  solution: Board;
  givens: boolean[][];
}

export interface GameMove {
  row: number;
  col: number;
  previousValue: CellValue;
  previousNotes: number[];
  newValue: CellValue;
  newNotes: number[];
  isNoteMode: boolean;
}

export interface ActiveGame {
  levelId: number;
  puzzle: Board;
  solution: Board;
  givens: boolean[][];
  notes: Notes;
  hintsUsed: number;
  elapsedSeconds: number;
  startedAt: number;
}

export interface GameStatistics {
  gamesPlayed: number;
  gamesWon: number;
  totalTimeSeconds: number;
  bestStreak: number;
  currentStreak: number;
}

export interface ProgressData {
  unlockedLevels: number[];
  levelProgress: Record<number, LevelProgress>;
  statistics: GameStatistics;
}

export interface SettingsData {
  darkMode: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  text: string;
  textSecondary: string;
  accent: string;
  error: string;
  success: string;
  gridLine: string;
  gridLineBold: string;
  highlight: string;
  highlightSame: string;
  buttonText: string;
  locked: string;
}
