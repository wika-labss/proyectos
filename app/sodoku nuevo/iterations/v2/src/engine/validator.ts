import { Board, CellPosition, CellValue } from '../types';
import { isValidPlacement } from './solver';

export function getConflicts(board: Board, row: number, col: number, value: CellValue): CellPosition[] {
  if (value === 0) {
    return [];
  }

  const conflicts: CellPosition[] = [];

  for (let index = 0; index < 9; index += 1) {
    if (board[row][index] === value && index !== col) {
      conflicts.push({ row, col: index });
    }
    if (board[index][col] === value && index !== row) {
      conflicts.push({ row: index, col });
    }
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  for (let rowOffset = 0; rowOffset < 3; rowOffset += 1) {
    for (let colOffset = 0; colOffset < 3; colOffset += 1) {
      const currentRow = boxRow + rowOffset;
      const currentCol = boxCol + colOffset;
      if (
        board[currentRow][currentCol] === value &&
        (currentRow !== row || currentCol !== col) &&
        !conflicts.some((item) => item.row === currentRow && item.col === currentCol)
      ) {
        conflicts.push({ row: currentRow, col: currentCol });
      }
    }
  }

  return conflicts;
}

export function getBoardConflicts(board: Board): CellPosition[] {
  const conflicts: CellPosition[] = [];

  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      const value = board[row][col];
      if (value !== 0) {
        const cellConflicts = getConflicts(board, row, col, value);
        if (cellConflicts.length > 0) {
          conflicts.push({ row, col }, ...cellConflicts);
        }
      }
    }
  }

  const unique = new Map<string, CellPosition>();
  conflicts.forEach((position) => {
    unique.set(`${position.row}-${position.col}`, position);
  });

  return Array.from(unique.values());
}

export function isMoveValid(board: Board, row: number, col: number, value: CellValue): boolean {
  if (value === 0) {
    return true;
  }
  return isValidPlacement(board, row, col, value);
}
