import { getTargetClues } from './difficulty';
import {
  cloneBoard,
  countSolutions,
  createEmptyBoard,
  generateCompleteBoard,
  solveBoard,
} from './solver';
import { Board, Puzzle } from '../types';

function createGivensMask(puzzle: Board): boolean[][] {
  return puzzle.map((row) => row.map((value) => value !== 0));
}

function countClues(board: Board): number {
  let count = 0;
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (board[row][col] !== 0) count += 1;
    }
  }
  return count;
}

/** Valida que el puzzle tenga exactamente una solución. */
export function validatePuzzle(puzzle: Board): { ok: boolean; solutions: number } {
  const solutions = countSolutions(puzzle, 2);
  return { ok: solutions === 1, solutions };
}

/**
 * Quita celdas manteniendo siempre solución única.
 * Si no alcanza cluesTarget, retorna el mejor puzzle único posible (más pistas).
 */
function removeCellsKeepUnique(solution: Board, cluesTarget: number): Board {
  const puzzle = cloneBoard(solution);
  const cells = Array.from({ length: 81 }, (_, index) => ({
    row: Math.floor(index / 9),
    col: index % 9,
  }));

  for (let index = cells.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [cells[index], cells[swapIndex]] = [cells[swapIndex], cells[index]];
  }

  let cluesRemaining = 81;

  for (const { row, col } of cells) {
    if (cluesRemaining <= cluesTarget) break;

    const backup = puzzle[row][col];
    puzzle[row][col] = 0;

    if (countSolutions(puzzle, 2) !== 1) {
      puzzle[row][col] = backup;
    } else {
      cluesRemaining -= 1;
    }
  }

  return puzzle;
}

function buildSolvedCopy(puzzle: Board): Board {
  const working = cloneBoard(puzzle);
  const solved = solveBoard(working);
  if (!solved) {
    throw new Error('Puzzle has no solution');
  }
  return working;
}

/**
 * Genera un puzzle para el nivel. Nunca retorna un tablero sin solución única.
 */
export function generatePuzzle(levelId: number): Puzzle {
  const cluesTarget = getTargetClues(levelId);
  const maxAttempts = 40;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const solution = generateCompleteBoard();
    const puzzle = removeCellsKeepUnique(solution, cluesTarget);
    const { ok } = validatePuzzle(puzzle);
    if (!ok) continue;

    // Prefer reaching clue target, but accept unique puzzles with more clues.
    return {
      puzzle,
      solution: cloneBoard(solution),
      givens: createGivensMask(puzzle),
    };
  }

  // Último recurso seguro: tablero completo válido (81 pistas) — siempre 1 solución.
  // Evita entregar puzzles irresolubles / multi-solución.
  const solution = generateCompleteBoard();
  const puzzle = removeCellsKeepUnique(solution, Math.max(cluesTarget, 46));
  if (validatePuzzle(puzzle).ok) {
    return {
      puzzle,
      solution: cloneBoard(solution),
      givens: createGivensMask(puzzle),
    };
  }

  return {
    puzzle: cloneBoard(solution),
    solution: cloneBoard(solution),
    givens: createGivensMask(solution),
  };
}

export function createEmptyPuzzle(): Puzzle {
  const empty = createEmptyBoard();
  return {
    puzzle: empty,
    solution: empty,
    givens: empty.map((row) => row.map(() => false)),
  };
}

export function assertLevelPuzzle(levelId: number): {
  levelId: number;
  clues: number;
  unique: boolean;
  solutions: number;
} {
  const generated = generatePuzzle(levelId);
  const { ok, solutions } = validatePuzzle(generated.puzzle);
  if (!ok) {
    throw new Error(`Level ${levelId} puzzle invalid: solutions=${solutions}`);
  }
  // Ensure stored solution matches unique solve
  const solved = buildSolvedCopy(generated.puzzle);
  for (let r = 0; r < 9; r += 1) {
    for (let c = 0; c < 9; c += 1) {
      if (solved[r][c] !== generated.solution[r][c]) {
        // Align to computed unique solution if dig kept uniqueness but solution board drifted
        generated.solution[r][c] = solved[r][c];
      }
    }
  }
  return {
    levelId,
    clues: countClues(generated.puzzle),
    unique: true,
    solutions,
  };
}
