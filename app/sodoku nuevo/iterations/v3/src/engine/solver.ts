import { Board, CellValue } from '../types';

export function createEmptyBoard(): Board {
  return Array.from({ length: 9 }, () => Array(9).fill(0) as CellValue[]);
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

export function isValidPlacement(board: Board, row: number, col: number, value: CellValue): boolean {
  if (value === 0) {
    return true;
  }

  for (let index = 0; index < 9; index += 1) {
    if (board[row][index] === value && index !== col) {
      return false;
    }
    if (board[index][col] === value && index !== row) {
      return false;
    }
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  for (let rowOffset = 0; rowOffset < 3; rowOffset += 1) {
    for (let colOffset = 0; colOffset < 3; colOffset += 1) {
      const currentRow = boxRow + rowOffset;
      const currentCol = boxCol + colOffset;
      if (board[currentRow][currentCol] === value && (currentRow !== row || currentCol !== col)) {
        return false;
      }
    }
  }

  return true;
}

export function findEmptyCell(board: Board): { row: number; col: number } | null {
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (board[row][col] === 0) {
        return { row, col };
      }
    }
  }
  return null;
}

export function solveBoard(board: Board): boolean {
  const empty = findEmptyCell(board);
  if (!empty) {
    return true;
  }

  const { row, col } = empty;
  const numbers = shuffleNumbers();

  for (const value of numbers) {
    if (isValidPlacement(board, row, col, value)) {
      board[row][col] = value;
      if (solveBoard(board)) {
        return true;
      }
      board[row][col] = 0;
    }
  }

  return false;
}

export function countSolutions(board: Board, limit = 2): number {
  const workingBoard = cloneBoard(board);
  return countSolutionsRecursive(workingBoard, limit);
}

function countSolutionsRecursive(board: Board, limit: number): number {
  const empty = findEmptyCell(board);
  if (!empty) {
    return 1;
  }

  let solutions = 0;
  const { row, col } = empty;

  for (let value = 1; value <= 9; value += 1) {
    if (isValidPlacement(board, row, col, value as CellValue)) {
      board[row][col] = value as CellValue;
      solutions += countSolutionsRecursive(board, limit);
      if (solutions >= limit) {
        return solutions;
      }
      board[row][col] = 0;
    }
  }

  return solutions;
}

export function isBoardComplete(board: Board): boolean {
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      const value = board[row][col];
      if (value === 0 || !isValidPlacement(board, row, col, value)) {
        return false;
      }
    }
  }
  return true;
}

export function shuffleNumbers(): CellValue[] {
  const numbers: CellValue[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let index = numbers.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [numbers[index], numbers[swapIndex]] = [numbers[swapIndex], numbers[index]];
  }
  return numbers;
}

export function fillBox(board: Board, row: number, col: number): void {
  const numbers = shuffleNumbers();
  let numberIndex = 0;

  for (let rowOffset = 0; rowOffset < 3; rowOffset += 1) {
    for (let colOffset = 0; colOffset < 3; colOffset += 1) {
      board[row + rowOffset][col + colOffset] = numbers[numberIndex];
      numberIndex += 1;
    }
  }
}

export function generateCompleteBoard(): Board {
  const board = createEmptyBoard();

  for (let box = 0; box < 9; box += 3) {
    fillBox(board, box, box);
  }

  solveBoard(board);
  return board;
}
