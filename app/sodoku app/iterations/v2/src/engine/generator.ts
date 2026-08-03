import { getTargetClues } from './difficulty';
import { Board, Puzzle } from '../types';
import {
  cloneBoard,
  countSolutions,
  createEmptyBoard,
  generateCompleteBoard,
  isValidPlacement,
  solveBoard,
} from './solver';

function createGivensMask(puzzle: Board): boolean[][] {
  return puzzle.map((row) => row.map((value) => value !== 0));
}

function isBoardFilled(board: Board): boolean {
  return board.every((row) => row.every((value) => value !== 0));
}

function puzzleMatchesSolution(puzzle: Board, solution: Board): boolean {
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (puzzle[row][col] !== 0 && puzzle[row][col] !== solution[row][col]) {
        return false;
      }
    }
  }
  return true;
}

export function validatePuzzle(puzzle: Puzzle): boolean {
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      const value = puzzle.puzzle[row][col];
      if (value !== 0 && !isValidPlacement(puzzle.puzzle, row, col, value)) {
        return false;
      }
    }
  }

  if (!isBoardFilled(puzzle.solution)) {
    return false;
  }

  if (!puzzleMatchesSolution(puzzle.puzzle, puzzle.solution)) {
    return false;
  }

  return countSolutions(puzzle.puzzle, 2) === 1;
}

function removeCells(solution: Board, cluesTarget: number): Board | null {
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
    if (cluesRemaining <= cluesTarget) {
      break;
    }

    const backup = puzzle[row][col];
    puzzle[row][col] = 0;

    if (countSolutions(puzzle, 2) !== 1) {
      puzzle[row][col] = backup;
    } else {
      cluesRemaining -= 1;
    }
  }

  if (countSolutions(puzzle, 2) !== 1) {
    return null;
  }

  return puzzle;
}

export function generatePuzzle(levelId: number): Puzzle {
  return generatePuzzleWithClues(levelId, getTargetClues(levelId));
}

export function generatePuzzleWithClues(levelId: number, cluesTarget: number): Puzzle {
  const maxAttempts = 100;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const solution = generateCompleteBoard();
    const puzzleBoard = removeCells(solution, cluesTarget);

    if (!puzzleBoard) {
      continue;
    }

    const puzzle: Puzzle = {
      puzzle: puzzleBoard,
      solution: cloneBoard(solution),
      givens: createGivensMask(puzzleBoard),
    };

    if (validatePuzzle(puzzle)) {
      return puzzle;
    }
  }

  throw new Error(`Failed to generate valid puzzle for level ${levelId}`);
}

export function createEmptyPuzzle(): Puzzle {
  const empty = createEmptyBoard();
  return {
    puzzle: empty,
    solution: empty,
    givens: empty.map((row) => row.map(() => false)),
  };
}

/** Verify a filled board is a valid solved Sudoku. */
export function isValidSolvedBoard(board: Board): boolean {
  if (!isBoardFilled(board)) {
    return false;
  }

  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (!isValidPlacement(board, row, col, board[row][col])) {
        return false;
      }
    }
  }

  return true;
}

/** Solve puzzle and return true if exactly one solution exists. */
export function verifyUniqueSolution(puzzle: Board): boolean {
  const working = cloneBoard(puzzle);
  return countSolutions(working, 2) === 1 && solveBoard(cloneBoard(puzzle));
}
