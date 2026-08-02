import { create } from 'zustand';
import { generatePuzzle } from '../engine/generator';
import { isBoardComplete } from '../engine/solver';
import { getBoardConflicts } from '../engine/validator';
import {
  ActiveGame,
  Board,
  CellPosition,
  CellValue,
  GameMove,
  Notes,
} from '../types';
import { loadJson, removeKey, saveJson, STORAGE_KEYS } from '../utils/storage';

function createEmptyNotes(): Notes {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => new Set<number>()),
  );
}

function cloneNotes(notes: Notes): Notes {
  return notes.map((row) => row.map((cellNotes) => new Set(cellNotes)));
}

function notesToArray(notes: Notes, row: number, col: number): number[] {
  return Array.from(notes[row][col]).sort((a, b) => a - b);
}

interface GameStore {
  levelId: number | null;
  board: Board;
  solution: Board;
  givens: boolean[][];
  notes: Notes;
  selectedCell: CellPosition | null;
  noteMode: boolean;
  hintsUsed: number;
  elapsedSeconds: number;
  history: GameMove[];
  redoStack: GameMove[];
  conflictCells: CellPosition[];
  completed: boolean;
  startLevel: (levelId: number) => Promise<void>;
  restoreActiveGame: () => Promise<boolean>;
  selectCell: (row: number, col: number) => void;
  toggleNoteMode: () => void;
  inputNumber: (value: CellValue) => void;
  clearCell: () => void;
  undo: () => void;
  redo: () => void;
  useHint: () => boolean;
  tick: () => Promise<void>;
  persistActiveGame: () => Promise<void>;
  clearActiveGame: () => Promise<void>;
}

function serializeNotes(notes: Notes): number[][][] {
  return notes.map((row) => row.map((cellNotes) => Array.from(cellNotes)));
}

function deserializeNotes(raw: number[][][]): Notes {
  return raw.map((row) => row.map((cellNotes) => new Set(cellNotes)));
}

export const useGameStore = create<GameStore>((set, get) => ({
  levelId: null,
  board: Array.from({ length: 9 }, () => Array(9).fill(0)),
  solution: Array.from({ length: 9 }, () => Array(9).fill(0)),
  givens: Array.from({ length: 9 }, () => Array(9).fill(false)),
  notes: createEmptyNotes(),
  selectedCell: null,
  noteMode: false,
  hintsUsed: 0,
  elapsedSeconds: 0,
  history: [],
  redoStack: [],
  conflictCells: [],
  completed: false,
  startLevel: async (levelId) => {
    const puzzle = generatePuzzle(levelId);
    set({
      levelId,
      board: puzzle.puzzle.map((row) => [...row]),
      solution: puzzle.solution.map((row) => [...row]),
      givens: puzzle.givens.map((row) => [...row]),
      notes: createEmptyNotes(),
      selectedCell: null,
      noteMode: false,
      hintsUsed: 0,
      elapsedSeconds: 0,
      history: [],
      redoStack: [],
      conflictCells: [],
      completed: false,
    });
    await get().persistActiveGame();
  },
  restoreActiveGame: async () => {
    const saved = await loadJson<ActiveGame & { notes: number[][][]; history: GameMove[] } | null>(
      STORAGE_KEYS.activeGame,
      null,
    );

    if (!saved) {
      return false;
    }

    set({
      levelId: saved.levelId,
      board: saved.puzzle.map((row) => [...row]),
      solution: saved.solution.map((row) => [...row]),
      givens: saved.givens.map((row) => [...row]),
      notes: deserializeNotes(saved.notes),
      selectedCell: null,
      noteMode: false,
      hintsUsed: saved.hintsUsed,
      elapsedSeconds: saved.elapsedSeconds,
      history: saved.history ?? [],
      redoStack: [],
      conflictCells: getBoardConflicts(saved.puzzle),
      completed: false,
    });

    return true;
  },
  selectCell: (row, col) => {
    if (get().givens[row][col]) {
      return;
    }
    set({ selectedCell: { row, col } });
  },
  toggleNoteMode: () => {
    set({ noteMode: !get().noteMode });
  },
  inputNumber: (value) => {
    const state = get();
    const { selectedCell, noteMode, givens, board, notes } = state;

    if (!selectedCell) {
      return;
    }

    const { row, col } = selectedCell;
    if (givens[row][col]) {
      return;
    }

    const previousValue = board[row][col];
    const previousNotes = notesToArray(notes, row, col);
    const nextBoard = board.map((boardRow) => [...boardRow]);
    const nextNotes = cloneNotes(notes);

    if (noteMode) {
      if (value === 0) {
        return;
      }

      if (nextNotes[row][col].has(value)) {
        nextNotes[row][col].delete(value);
      } else {
        nextNotes[row][col].add(value);
      }

      const move: GameMove = {
        row,
        col,
        previousValue,
        previousNotes,
        newValue: previousValue,
        newNotes: notesToArray(nextNotes, row, col),
        isNoteMode: true,
      };

      set({
        notes: nextNotes,
        history: [...state.history, move],
        redoStack: [],
        conflictCells: getBoardConflicts(nextBoard),
      });
      void get().persistActiveGame();
      return;
    }

    nextBoard[row][col] = value;
    nextNotes[row][col] = new Set<number>();

    const move: GameMove = {
      row,
      col,
      previousValue,
      previousNotes,
      newValue: value,
      newNotes: [],
      isNoteMode: false,
    };

    const completed = isBoardComplete(nextBoard) && getBoardConflicts(nextBoard).length === 0;

    set({
      board: nextBoard,
      notes: nextNotes,
      history: [...state.history, move],
      redoStack: [],
      conflictCells: getBoardConflicts(nextBoard),
      completed,
    });

    void get().persistActiveGame();
  },
  clearCell: () => {
    const state = get();
    const { selectedCell, givens, board, notes } = state;
    if (!selectedCell || givens[selectedCell.row][selectedCell.col]) {
      return;
    }

    const { row, col } = selectedCell;
    const previousValue = board[row][col];
    if (previousValue === 0 && notes[row][col].size === 0) {
      return;
    }

    const previousNotes = notesToArray(notes, row, col);
    const nextBoard = board.map((boardRow) => [...boardRow]);
    const nextNotes = cloneNotes(notes);
    nextBoard[row][col] = 0;
    nextNotes[row][col] = new Set<number>();

    const move: GameMove = {
      row,
      col,
      previousValue,
      previousNotes,
      newValue: 0,
      newNotes: [],
      isNoteMode: false,
    };

    set({
      board: nextBoard,
      notes: nextNotes,
      history: [...state.history, move],
      redoStack: [],
      conflictCells: getBoardConflicts(nextBoard),
      completed: false,
    });

    void get().persistActiveGame();
  },
  undo: () => {
    const state = get();
    const lastMove = state.history[state.history.length - 1];
    if (!lastMove) {
      return;
    }

    const nextBoard = state.board.map((row) => [...row]);
    const nextNotes = cloneNotes(state.notes);
    nextBoard[lastMove.row][lastMove.col] = lastMove.previousValue;
    nextNotes[lastMove.row][lastMove.col] = new Set(lastMove.previousNotes);

    set({
      board: nextBoard,
      notes: nextNotes,
      history: state.history.slice(0, -1),
      redoStack: [...state.redoStack, lastMove],
      conflictCells: getBoardConflicts(nextBoard),
      completed: false,
    });

    void get().persistActiveGame();
  },
  redo: () => {
    const state = get();
    const nextMove = state.redoStack[state.redoStack.length - 1];
    if (!nextMove) {
      return;
    }

    const nextBoard = state.board.map((row) => [...row]);
    const nextNotes = cloneNotes(state.notes);
    nextBoard[nextMove.row][nextMove.col] = nextMove.newValue;
    nextNotes[nextMove.row][nextMove.col] = new Set(nextMove.newNotes);

    set({
      board: nextBoard,
      notes: nextNotes,
      history: [...state.history, nextMove],
      redoStack: state.redoStack.slice(0, -1),
      conflictCells: getBoardConflicts(nextBoard),
      completed: isBoardComplete(nextBoard) && getBoardConflicts(nextBoard).length === 0,
    });

    void get().persistActiveGame();
  },
  useHint: () => {
    const state = get();
    const { selectedCell, board, solution, givens } = state;

    let targetRow = selectedCell?.row ?? -1;
    let targetCol = selectedCell?.col ?? -1;

    if (
      targetRow === -1 ||
      targetCol === -1 ||
      givens[targetRow][targetCol] ||
      board[targetRow][targetCol] === solution[targetRow][targetCol]
    ) {
      const candidates: CellPosition[] = [];
      for (let row = 0; row < 9; row += 1) {
        for (let col = 0; col < 9; col += 1) {
          if (!givens[row][col] && board[row][col] !== solution[row][col]) {
            candidates.push({ row, col });
          }
        }
      }

      if (candidates.length === 0) {
        return false;
      }

      const randomCell = candidates[Math.floor(Math.random() * candidates.length)];
      targetRow = randomCell.row;
      targetCol = randomCell.col;
    }

    const previousValue = board[targetRow][targetCol];
    const previousNotes = notesToArray(state.notes, targetRow, targetCol);
    const nextBoard = board.map((row) => [...row]);
    const nextNotes = cloneNotes(state.notes);
    const correctValue = solution[targetRow][targetCol];

    nextBoard[targetRow][targetCol] = correctValue;
    nextNotes[targetRow][targetCol] = new Set<number>();

    const move: GameMove = {
      row: targetRow,
      col: targetCol,
      previousValue,
      previousNotes,
      newValue: correctValue,
      newNotes: [],
      isNoteMode: false,
    };

    const completed = isBoardComplete(nextBoard) && getBoardConflicts(nextBoard).length === 0;

    set({
      board: nextBoard,
      notes: nextNotes,
      selectedCell: { row: targetRow, col: targetCol },
      hintsUsed: state.hintsUsed + 1,
      history: [...state.history, move],
      redoStack: [],
      conflictCells: getBoardConflicts(nextBoard),
      completed,
    });

    void get().persistActiveGame();
    return true;
  },
  tick: async () => {
    if (get().completed) {
      return;
    }
    set({ elapsedSeconds: get().elapsedSeconds + 1 });
    await get().persistActiveGame();
  },
  persistActiveGame: async () => {
    const state = get();
    if (state.levelId === null || state.completed) {
      return;
    }

    const payload = {
      levelId: state.levelId,
      puzzle: state.board,
      solution: state.solution,
      givens: state.givens,
      notes: serializeNotes(state.notes),
      hintsUsed: state.hintsUsed,
      elapsedSeconds: state.elapsedSeconds,
      startedAt: Date.now(),
      history: state.history,
    };

    await saveJson(STORAGE_KEYS.activeGame, payload);
  },
  clearActiveGame: async () => {
    await removeKey(STORAGE_KEYS.activeGame);
  },
}));
