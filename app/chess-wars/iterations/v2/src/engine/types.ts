export type Color = 'w' | 'b';
export type PieceType = 'k' | 'q' | 'r' | 'b' | 'n' | 'p';
export type Piece = { type: PieceType; color: Color };
export type Board = (Piece | null)[];
export type Square = number;

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
export type GameMode = 'classic' | 'evolutive';
export type LoadoutId = 'A' | 'B';

export type EvolutionBranch = 'drone' | 'fortress' | 'interceptor';

export type PieceRuntime = {
  xp: number;
  evolved: EvolutionBranch | null;
  abilityAvailable: boolean;
  fortifiedTurns: number;
};

export type EvolutiveState = {
  base: GameState;
  energy: number;
  maxEnergy: number;
  /** runtime keyed by square at start of action; remapped on moves */
  pieces: Record<string, PieceRuntime>;
  loadout: LoadoutId;
  pendingInterceptorFrom: Square | null;
};

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

export function squareKey(s: Square): string {
  return String(s);
}
