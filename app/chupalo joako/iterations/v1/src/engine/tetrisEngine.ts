import { COLS, ROWS, SPAWN_X, SPAWN_Y } from '../constants/game';

export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
export type CellValue = 0 | PieceType;
export type Rot = 0 | 1 | 2 | 3;

export type Piece = {
  type: PieceType;
  rot: Rot;
  x: number;
  y: number;
};

export type Board = {
  cols: number;
  rows: number;
  cells: CellValue[];
};

export type Cell = { x: number; y: number };

export const PIECE_TYPES: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

/** 4 rotation states; offsets from piece origin. */
export const SHAPES: Record<PieceType, [number, number][][]> = {
  I: [
    [[0, 1], [1, 1], [2, 1], [3, 1]],
    [[2, 0], [2, 1], [2, 2], [2, 3]],
    [[0, 2], [1, 2], [2, 2], [3, 2]],
    [[1, 0], [1, 1], [1, 2], [1, 3]],
  ],
  O: [
    [[1, 0], [2, 0], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [2, 1]],
  ],
  T: [
    [[1, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [1, 1], [2, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [1, 2]],
    [[1, 0], [0, 1], [1, 1], [1, 2]],
  ],
  S: [
    [[1, 0], [2, 0], [0, 1], [1, 1]],
    [[1, 0], [1, 1], [2, 1], [2, 2]],
    [[1, 1], [2, 1], [0, 2], [1, 2]],
    [[0, 0], [0, 1], [1, 1], [1, 2]],
  ],
  Z: [
    [[0, 0], [1, 0], [1, 1], [2, 1]],
    [[2, 0], [1, 1], [2, 1], [1, 2]],
    [[0, 1], [1, 1], [1, 2], [2, 2]],
    [[1, 0], [0, 1], [1, 1], [0, 2]],
  ],
  J: [
    [[0, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [2, 2]],
    [[1, 0], [1, 1], [0, 2], [1, 2]],
  ],
  L: [
    [[2, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [1, 1], [1, 2], [2, 2]],
    [[0, 1], [1, 1], [2, 1], [0, 2]],
    [[0, 0], [1, 0], [1, 1], [1, 2]],
  ],
};

export function createBoard(cols = COLS, rows = ROWS): Board {
  return { cols, rows, cells: Array<CellValue>(cols * rows).fill(0) };
}

export function cellIndex(board: Board, x: number, y: number): number {
  return y * board.cols + x;
}

export function getCell(board: Board, x: number, y: number): CellValue {
  if (x < 0 || x >= board.cols || y < 0 || y >= board.rows) return 0;
  return board.cells[cellIndex(board, x, y)]!;
}

export function cellsOf(piece: Piece): Cell[] {
  const shape = SHAPES[piece.type][piece.rot]!;
  return shape.map(([dx, dy]) => ({ x: piece.x + dx, y: piece.y + dy }));
}

export function collides(board: Board, piece: Piece): boolean {
  for (const c of cellsOf(piece)) {
    if (c.x < 0 || c.x >= board.cols || c.y >= board.rows) return true;
    if (c.y >= 0 && board.cells[cellIndex(board, c.x, c.y)] !== 0) return true;
  }
  return false;
}

export function tryMove(board: Board, piece: Piece, dx: number, dy: number): Piece | null {
  const next: Piece = { ...piece, x: piece.x + dx, y: piece.y + dy };
  return collides(board, next) ? null : next;
}

const KICKS: [number, number][] = [
  [0, 0],
  [-1, 0],
  [1, 0],
];

export function tryRotateCW(board: Board, piece: Piece): Piece | null {
  const rot = ((piece.rot + 1) % 4) as Rot;
  for (const [kx, ky] of KICKS) {
    const next: Piece = { ...piece, rot, x: piece.x + kx, y: piece.y + ky };
    if (!collides(board, next)) return next;
  }
  return null;
}

export function hardDropY(board: Board, piece: Piece): number {
  let y = piece.y;
  while (true) {
    const next = tryMove(board, { ...piece, y }, 0, 1);
    if (!next) return y;
    y = next.y;
  }
}

export function hardDropDistance(board: Board, piece: Piece): number {
  return hardDropY(board, piece) - piece.y;
}

function clearFullLines(board: Board): { board: Board; linesCleared: number } {
  const kept: CellValue[][] = [];
  for (let y = 0; y < board.rows; y += 1) {
    const row = board.cells.slice(y * board.cols, (y + 1) * board.cols);
    if (row.some((c) => c === 0)) kept.push(row);
  }
  const linesCleared = board.rows - kept.length;
  const empty: CellValue[] = Array<CellValue>(board.cols).fill(0);
  while (kept.length < board.rows) kept.unshift(empty.slice());
  return {
    board: { ...board, cells: kept.flat() },
    linesCleared,
  };
}

export function lock(
  board: Board,
  piece: Piece
): { board: Board; linesCleared: number } {
  const cells = board.cells.slice();
  for (const c of cellsOf(piece)) {
    if (c.y < 0 || c.y >= board.rows || c.x < 0 || c.x >= board.cols) continue;
    cells[cellIndex(board, c.x, c.y)] = piece.type;
  }
  return clearFullLines({ ...board, cells });
}

export type SpawnResult =
  | { piece: Piece; topOut: false }
  | { piece: null; topOut: true };

export function spawn(board: Board, type: PieceType): SpawnResult {
  const piece: Piece = { type, rot: 0, x: SPAWN_X, y: SPAWN_Y };
  if (collides(board, piece)) return { piece: null, topOut: true };
  return { piece, topOut: false };
}

export function fillCell(board: Board, x: number, y: number, value: CellValue): Board {
  const cells = board.cells.slice();
  cells[cellIndex(board, x, y)] = value;
  return { ...board, cells };
}
