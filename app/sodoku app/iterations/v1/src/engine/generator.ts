import { getTargetClues } from './difficulty';
import {
  cloneBoard,
  countSolutions,
  createEmptyBoard,
  generateCompleteBoard,
} from './solver';
import { Board, Puzzle } from '../types';

function createGivensMask(puzzle: Board): boolean[][] {
  return puzzle.map((row) => row.map((value) => value !== 0));
}

function removeCells(solution: Board, cluesTarget: number): Board {
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

    const solutions = countSolutions(puzzle, 2);
    if (solutions !== 1) {
      puzzle[row][col] = backup;
    } else {
      cluesRemaining -= 1;
    }
  }

  return puzzle;
}

export function generatePuzzle(levelId: number): Puzzle {
  const cluesTarget = getTargetClues(levelId);
  let attempts = 0;

  while (attempts < 20) {
    const solution = generateCompleteBoard();
    const puzzle = removeCells(solution, cluesTarget);

    if (countSolutions(puzzle, 2) === 1) {
      return {
        puzzle,
        solution: cloneBoard(solution),
        givens: createGivensMask(puzzle),
      };
    }

    attempts += 1;
  }

  const fallbackSolution = generateCompleteBoard();
  const fallbackPuzzle = cloneBoard(fallbackSolution);

  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (Math.random() > cluesTarget / 81) {
        fallbackPuzzle[row][col] = 0;
      }
    }
  }

  return {
    puzzle: fallbackPuzzle,
    solution: fallbackSolution,
    givens: createGivensMask(fallbackPuzzle),
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
