import { create } from 'zustand';
import {
  cloneBoard,
  generatePuzzle,
  getBoardConflicts,
  isBoardComplete,
  isMoveValid,
} from '../engine';
import { loadJson, removeKey, saveJson, STORAGE_KEYS } from '../modules/local-storage';
import {
  applyScore,
  scoreBonusForWin,
  scoreForValidMove,
  scorePenaltyForError,
} from '../modules/scoring';
import { ActiveGame, Board, CellValue } from '../types';

interface GameState {
  levelId: number | null;
  board: Board | null;
  solution: Board | null;
  givens: boolean[][] | null;
  selected: { row: number; col: number } | null;
  conflicts: { row: number; col: number }[];
  score: number;
  won: boolean;
  loading: boolean;
  startLevel: (levelId: number) => Promise<void>;
  resetLevel: () => Promise<void>;
  selectCell: (row: number, col: number) => void;
  placeNumber: (value: CellValue) => { won: boolean; delta: number };
  clearCell: () => void;
  restoreActiveGame: () => Promise<void>;
  clearActiveGame: () => Promise<void>;
}

function toActiveGame(state: GameState): ActiveGame | null {
  if (!state.levelId || !state.board || !state.solution || !state.givens) return null;
  return {
    levelId: state.levelId,
    board: state.board,
    solution: state.solution,
    givens: state.givens,
    score: state.score,
  };
}

export const useGameStore = create<GameState>((set, get) => ({
  levelId: null,
  board: null,
  solution: null,
  givens: null,
  selected: null,
  conflicts: [],
  score: 0,
  won: false,
  loading: false,

  startLevel: async (levelId) => {
    set({ loading: true, won: false, selected: null, conflicts: [], score: 0 });
    const puzzle = generatePuzzle(levelId);
    const next = {
      levelId,
      board: cloneBoard(puzzle.puzzle),
      solution: cloneBoard(puzzle.solution),
      givens: puzzle.givens,
      selected: null as { row: number; col: number } | null,
      conflicts: [] as { row: number; col: number }[],
      score: 0,
      won: false,
      loading: false,
    };
    set(next);
    await saveJson(STORAGE_KEYS.activeGame, toActiveGame({ ...get(), ...next }));
  },

  resetLevel: async () => {
    const levelId = get().levelId;
    if (!levelId) return;
    await get().startLevel(levelId);
  },

  selectCell: (row, col) => {
    const { givens, won } = get();
    if (won || !givens || givens[row][col]) return;
    set({ selected: { row, col } });
  },

  placeNumber: (value) => {
    const state = get();
    if (state.won || !state.board || !state.givens || !state.selected) {
      return { won: false, delta: 0 };
    }
    const { row, col } = state.selected;
    if (state.givens[row][col]) return { won: false, delta: 0 };

    const board = cloneBoard(state.board);
    board[row][col] = value;

    let delta = 0;
    let conflicts = getBoardConflicts(board);

    if (value !== 0 && !isMoveValid(state.board, row, col, value)) {
      delta = scorePenaltyForError();
    } else if (value !== 0) {
      delta = scoreForValidMove();
      conflicts = getBoardConflicts(board);
    }

    const score = applyScore(state.score, delta);
    const won = isBoardComplete(board);
    const finalScore = won
      ? applyScore(score, scoreBonusForWin(state.levelId ?? 1))
      : score;

    set({ board, conflicts, score: finalScore, won });
    void saveJson(STORAGE_KEYS.activeGame, toActiveGame({ ...get(), board, score: finalScore, won }));
    return { won, delta: finalScore - state.score };
  },

  clearCell: () => {
    get().placeNumber(0);
  },

  restoreActiveGame: async () => {
    const active = await loadJson<ActiveGame | null>(STORAGE_KEYS.activeGame, null);
    if (!active) return;
    set({
      levelId: active.levelId,
      board: active.board,
      solution: active.solution,
      givens: active.givens,
      score: active.score,
      conflicts: getBoardConflicts(active.board),
      selected: null,
      won: isBoardComplete(active.board),
      loading: false,
    });
  },

  clearActiveGame: async () => {
    await removeKey(STORAGE_KEYS.activeGame);
    set({
      levelId: null,
      board: null,
      solution: null,
      givens: null,
      selected: null,
      conflicts: [],
      score: 0,
      won: false,
      loading: false,
    });
  },
}));
