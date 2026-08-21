export type Color = 'w' | 'b';
export type PieceType = 'k' | 'q' | 'r' | 'b' | 'n' | 'p';
export type Piece = { type: PieceType; color: Color };
export type Board = (Piece | null)[];
export type Square = number; // 0..63, a1=0 … h8=63

export type Move = {
  from: Square;
  to: Square;
  promotion?: PieceType;
  captured?: Piece | null;
  isCastle?: boolean;
  isEnPassant?: boolean;
};

export type CastlingRights = {
  wK: boolean;
  wQ: boolean;
  bK: boolean;
  bQ: boolean;
};

export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw';

export type GameState = {
  board: Board;
  sideToMove: Color;
  castling: CastlingRights;
  enPassant: Square | null;
  halfmove: number;
  fullmove: number;
  status: GameStatus;
  winner: Color | null;
};

export type AiDifficulty = 'easy' | 'medium';

export const FILES = 'abcdefgh';

export function sq(file: number, rank: number): Square {
  return rank * 8 + file;
}

export function fileOf(s: Square): number {
  return s % 8;
}

export function rankOf(s: Square): number {
  return Math.floor(s / 8);
}

export function opposite(c: Color): Color {
  return c === 'w' ? 'b' : 'w';
}

export function algebraic(s: Square): string {
  return `${FILES[fileOf(s)]}${rankOf(s) + 1}`;
}
