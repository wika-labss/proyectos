import { create } from 'zustand';
import {
  cloneBoard,
  generatePuzzle,
  getBoardConflicts,
  isBoardComplete,
  isMoveValid,
  validatePuzzle,
} from '../engine';
import {
  applyHint,
  canUseHint,
  consumeHint,
  findHintTarget,
  initialHints,
} from '../modules/hints';
import { loadJson, removeKey, saveJson, STORAGE_KEYS } from '../modules/local-storage';
import {
  applyScore,
  scoreBonusForWin,
  scoreForValidMove,
  scorePenaltyForError,
} from '../modules/scoring';
import { ActiveGame, Board, CellValue, HINTS_PER_LEVEL } from '../types';

interface GameState {
  levelId: number | null;
  board: Board | null;
  solution: Board | null;
  givens: boolean[][] | null;
  selected: { row: number; col: number } | null;
  conflicts: { row: number; col: number }[];
  score: number;
  hintsLeft: number;
  won: boolean;
  loading: boolean;
  startLevel: (levelId: number) => Promise<void>;
  resetLevel: () => Promise<void>;
  selectCell: (row: number, col: number) => void;
  placeNumber: (value: CellValue) => { won: boolean; delta: number };
  useHint: () => boolean;
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
    hintsLeft: state.hintsLeft,
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
  hintsLeft: HINTS_PER_LEVEL,
  won: false,
  loading: false,

  startLevel: async (levelId) => {
    set({
      loading: true,
      won: false,
      selected: null,
      conflicts: [],
      score: 0,
      hintsLeft: initialHints(),
    });

    let puzzle = generatePuzzle(levelId);
    let guard = 0;
    while (!validatePuzzle(puzzle.puzzle).ok && guard < 10) {
      puzzle = generatePuzzle(levelId);
      guard += 1;
    }
    if (!validatePuzzle(puzzle.puzzle).ok) {
      set({ loading: false });
      throw new Error(`No se pudo generar puzzle válido para nivel ${levelId}`);
    }

    const next = {
      levelId,
      board: cloneBoard(puzzle.puzzle),
      solution: cloneBoard(puzzle.solution),
      givens: puzzle.givens,
      selected: null as { row: number; col: number } | null,
      conflicts: [] as { row: number; col: number }[],
      score: 0,
      hintsLeft: initialHints(),
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
    void saveJson(
      STORAGE_KEYS.activeGame,
      toActiveGame({ ...get(), board, score: finalScore, won })
    );
    return { won, delta: finalScore - state.score };
  },

  useHint: () => {
    const state = get();
    if (
      state.won ||
      !state.board ||
      !state.givens ||
      !state.solution ||
      !canUseHint(state.hintsLeft)
    ) {
      return false;
    }
    const target = findHintTarget(state.board, state.givens, state.selected);
    if (!target) return false;

    const applied = applyHint(state.board, state.givens, state.solution, target);
    const hintsLeft = consumeHint(state.hintsLeft);
    const conflicts = getBoardConflicts(applied.board);
    const won = isBoardComplete(applied.board);
    const score = won
      ? applyScore(state.score, scoreBonusForWin(state.levelId ?? 1))
      : state.score;

    set({
      board: applied.board,
      givens: applied.givens,
      hintsLeft,
      conflicts,
      selected: null,
      won,
      score,
    });
    void saveJson(STORAGE_KEYS.activeGame, toActiveGame({ ...get() }));
    return true;
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
      hintsLeft: active.hintsLeft ?? HINTS_PER_LEVEL,
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
      hintsLeft: HINTS_PER_LEVEL,
      won: false,
      loading: false,
    });
  },
}));
