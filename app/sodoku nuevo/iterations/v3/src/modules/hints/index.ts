import { Board, CellValue, HINTS_PER_LEVEL } from '../../types';

/** hints — exactamente 3 pistas por nivel */
export function initialHints(): number {
  return HINTS_PER_LEVEL;
}

export function canUseHint(hintsLeft: number): boolean {
  return hintsLeft > 0;
}

export function findHintTarget(
  board: Board,
  givens: boolean[][],
  selected: { row: number; col: number } | null
): { row: number; col: number } | null {
  if (
    selected &&
    board[selected.row][selected.col] === 0 &&
    !givens[selected.row][selected.col]
  ) {
    return selected;
  }
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (board[row][col] === 0 && !givens[row][col]) {
        return { row, col };
      }
    }
  }
  return null;
}

export function applyHint(
  board: Board,
  givens: boolean[][],
  solution: Board,
  target: { row: number; col: number }
): { board: Board; givens: boolean[][]; value: CellValue } {
  const nextBoard = board.map((r) => [...r]) as Board;
  const nextGivens = givens.map((r) => [...r]);
  const value = solution[target.row][target.col] as CellValue;
  nextBoard[target.row][target.col] = value;
  nextGivens[target.row][target.col] = true;
  return { board: nextBoard, givens: nextGivens, value };
}
