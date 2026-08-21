import {
  Board,
  CastlingRights,
  Color,
  GameState,
  GameStatus,
  Move,
  Piece,
  PieceType,
  Square,
  opposite,
  rankOf,
  fileOf,
  sq,
} from './types';

const INITIAL_BACK: PieceType[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];

function emptyBoard(): Board {
  return Array.from({ length: 64 }, () => null);
}

export function createInitialState(): GameState {
  const board = emptyBoard();
  for (let f = 0; f < 8; f++) {
    board[sq(f, 0)] = { type: INITIAL_BACK[f], color: 'w' };
    board[sq(f, 1)] = { type: 'p', color: 'w' };
    board[sq(f, 6)] = { type: 'p', color: 'b' };
    board[sq(f, 7)] = { type: INITIAL_BACK[f], color: 'b' };
  }
  return {
    board,
    sideToMove: 'w',
    castling: { wK: true, wQ: true, bK: true, bQ: true },
    enPassant: null,
    halfmove: 0,
    fullmove: 1,
    status: 'playing',
    winner: null,
  };
}

function cloneBoard(board: Board): Board {
  return board.map((p) => (p ? { ...p } : null));
}

function cloneState(state: GameState): GameState {
  return {
    ...state,
    board: cloneBoard(state.board),
    castling: { ...state.castling },
  };
}

function onBoard(file: number, rank: number): boolean {
  return file >= 0 && file < 8 && rank >= 0 && rank < 8;
}

function findKing(board: Board, color: Color): Square | null {
  for (let i = 0; i < 64; i++) {
    const p = board[i];
    if (p && p.type === 'k' && p.color === color) return i;
  }
  return null;
}

function isSquareAttacked(board: Board, target: Square, by: Color): boolean {
  const tf = fileOf(target);
  const tr = rankOf(target);

  // pawns
  const pawnDir = by === 'w' ? 1 : -1;
  for (const df of [-1, 1]) {
    const f = tf + df;
    const r = tr - pawnDir;
    if (onBoard(f, r)) {
      const p = board[sq(f, r)];
      if (p && p.color === by && p.type === 'p') return true;
    }
  }

  // knights
  const knightDeltas = [
    [1, 2],
    [2, 1],
    [-1, 2],
    [-2, 1],
    [1, -2],
    [2, -1],
    [-1, -2],
    [-2, -1],
  ];
  for (const [df, dr] of knightDeltas) {
    const f = tf + df;
    const r = tr + dr;
    if (onBoard(f, r)) {
      const p = board[sq(f, r)];
      if (p && p.color === by && p.type === 'n') return true;
    }
  }

  // king
  for (let df = -1; df <= 1; df++) {
    for (let dr = -1; dr <= 1; dr++) {
      if (df === 0 && dr === 0) continue;
      const f = tf + df;
      const r = tr + dr;
      if (onBoard(f, r)) {
        const p = board[sq(f, r)];
        if (p && p.color === by && p.type === 'k') return true;
      }
    }
  }

  // sliding: bishop/queen diagonals
  const diag = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  for (const [df, dr] of diag) {
    let f = tf + df;
    let r = tr + dr;
    while (onBoard(f, r)) {
      const p = board[sq(f, r)];
      if (p) {
        if (p.color === by && (p.type === 'b' || p.type === 'q')) return true;
        break;
      }
      f += df;
      r += dr;
    }
  }

  // sliding: rook/queen orthogonals
  const ortho = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  for (const [df, dr] of ortho) {
    let f = tf + df;
    let r = tr + dr;
    while (onBoard(f, r)) {
      const p = board[sq(f, r)];
      if (p) {
        if (p.color === by && (p.type === 'r' || p.type === 'q')) return true;
        break;
      }
      f += df;
      r += dr;
    }
  }

  return false;
}

export function inCheck(state: GameState, color: Color): boolean {
  const king = findKing(state.board, color);
  if (king === null) return true;
  return isSquareAttacked(state.board, king, opposite(color));
}

function pushMove(
  moves: Move[],
  from: Square,
  to: Square,
  board: Board,
  opts: Partial<Move> = {},
) {
  moves.push({
    from,
    to,
    captured: opts.captured ?? board[to],
    promotion: opts.promotion,
    isCastle: opts.isCastle,
    isEnPassant: opts.isEnPassant,
  });
}

function generatePseudoMoves(state: GameState, color: Color): Move[] {
  const { board, enPassant, castling } = state;
  const moves: Move[] = [];

  for (let from = 0; from < 64; from++) {
    const piece = board[from];
    if (!piece || piece.color !== color) continue;
    const f = fileOf(from);
    const r = rankOf(from);

    if (piece.type === 'p') {
      const dir = color === 'w' ? 1 : -1;
      const startRank = color === 'w' ? 1 : 6;
      const promoRank = color === 'w' ? 7 : 0;
      const one = sq(f, r + dir);
      if (onBoard(f, r + dir) && !board[one]) {
        if (r + dir === promoRank) {
          pushMove(moves, from, one, board, { promotion: 'q' });
        } else {
          pushMove(moves, from, one, board);
          if (r === startRank) {
            const two = sq(f, r + 2 * dir);
            if (!board[two]) pushMove(moves, from, two, board);
          }
        }
      }
      for (const df of [-1, 1]) {
        const tf = f + df;
        const tr = r + dir;
        if (!onBoard(tf, tr)) continue;
        const to = sq(tf, tr);
        const target = board[to];
        if (target && target.color !== color) {
          if (tr === promoRank) {
            pushMove(moves, from, to, board, { promotion: 'q', captured: target });
          } else {
            pushMove(moves, from, to, board, { captured: target });
          }
        } else if (enPassant === to) {
          const capSq = sq(tf, r);
          pushMove(moves, from, to, board, {
            captured: board[capSq],
            isEnPassant: true,
          });
        }
      }
    } else if (piece.type === 'n') {
      const deltas = [
        [1, 2],
        [2, 1],
        [-1, 2],
        [-2, 1],
        [1, -2],
        [2, -1],
        [-1, -2],
        [-2, -1],
      ];
      for (const [df, dr] of deltas) {
        const tf = f + df;
        const tr = r + dr;
        if (!onBoard(tf, tr)) continue;
        const to = sq(tf, tr);
        const target = board[to];
        if (!target || target.color !== color) {
          pushMove(moves, from, to, board, { captured: target });
        }
      }
    } else if (piece.type === 'b' || piece.type === 'r' || piece.type === 'q') {
      const dirs: number[][] = [];
      if (piece.type === 'b' || piece.type === 'q') {
        dirs.push([1, 1], [1, -1], [-1, 1], [-1, -1]);
      }
      if (piece.type === 'r' || piece.type === 'q') {
        dirs.push([1, 0], [-1, 0], [0, 1], [0, -1]);
      }
      for (const [df, dr] of dirs) {
        let tf = f + df;
        let tr = r + dr;
        while (onBoard(tf, tr)) {
          const to = sq(tf, tr);
          const target = board[to];
          if (!target) {
            pushMove(moves, from, to, board);
          } else {
            if (target.color !== color) {
              pushMove(moves, from, to, board, { captured: target });
            }
            break;
          }
          tf += df;
          tr += dr;
        }
      }
    } else if (piece.type === 'k') {
      for (let df = -1; df <= 1; df++) {
        for (let dr = -1; dr <= 1; dr++) {
          if (df === 0 && dr === 0) continue;
          const tf = f + df;
          const tr = r + dr;
          if (!onBoard(tf, tr)) continue;
          const to = sq(tf, tr);
          const target = board[to];
          if (!target || target.color !== color) {
            pushMove(moves, from, to, board, { captured: target });
          }
        }
      }
      // castling
      if (color === 'w' && r === 0 && f === 4) {
        if (
          castling.wK &&
          !board[sq(5, 0)] &&
          !board[sq(6, 0)] &&
          !isSquareAttacked(board, sq(4, 0), 'b') &&
          !isSquareAttacked(board, sq(5, 0), 'b') &&
          !isSquareAttacked(board, sq(6, 0), 'b')
        ) {
          pushMove(moves, from, sq(6, 0), board, { isCastle: true });
        }
        if (
          castling.wQ &&
          !board[sq(3, 0)] &&
          !board[sq(2, 0)] &&
          !board[sq(1, 0)] &&
          !isSquareAttacked(board, sq(4, 0), 'b') &&
          !isSquareAttacked(board, sq(3, 0), 'b') &&
          !isSquareAttacked(board, sq(2, 0), 'b')
        ) {
          pushMove(moves, from, sq(2, 0), board, { isCastle: true });
        }
      }
      if (color === 'b' && r === 7 && f === 4) {
        if (
          castling.bK &&
          !board[sq(5, 7)] &&
          !board[sq(6, 7)] &&
          !isSquareAttacked(board, sq(4, 7), 'w') &&
          !isSquareAttacked(board, sq(5, 7), 'w') &&
          !isSquareAttacked(board, sq(6, 7), 'w')
        ) {
          pushMove(moves, from, sq(6, 7), board, { isCastle: true });
        }
        if (
          castling.bQ &&
          !board[sq(3, 7)] &&
          !board[sq(2, 7)] &&
          !board[sq(1, 7)] &&
          !isSquareAttacked(board, sq(4, 7), 'w') &&
          !isSquareAttacked(board, sq(3, 7), 'w') &&
          !isSquareAttacked(board, sq(2, 7), 'w')
        ) {
          pushMove(moves, from, sq(2, 7), board, { isCastle: true });
        }
      }
    }
  }

  return moves;
}

function applyMoveRaw(state: GameState, move: Move): GameState {
  const next = cloneState(state);
  const piece = next.board[move.from];
  if (!piece) return next;

  next.board[move.from] = null;

  if (move.isEnPassant) {
    const capRank = piece.color === 'w' ? rankOf(move.to) - 1 : rankOf(move.to) + 1;
    next.board[sq(fileOf(move.to), capRank)] = null;
  }

  if (move.isCastle) {
    if (move.to === sq(6, 0)) {
      next.board[sq(7, 0)] = null;
      next.board[sq(5, 0)] = { type: 'r', color: 'w' };
    } else if (move.to === sq(2, 0)) {
      next.board[sq(0, 0)] = null;
      next.board[sq(3, 0)] = { type: 'r', color: 'w' };
    } else if (move.to === sq(6, 7)) {
      next.board[sq(7, 7)] = null;
      next.board[sq(5, 7)] = { type: 'r', color: 'b' };
    } else if (move.to === sq(2, 7)) {
      next.board[sq(0, 7)] = null;
      next.board[sq(3, 7)] = { type: 'r', color: 'b' };
    }
  }

  const placed: Piece = move.promotion
    ? { type: move.promotion, color: piece.color }
    : piece;
  next.board[move.to] = placed;

  // castling rights
  const rights: CastlingRights = { ...next.castling };
  if (piece.type === 'k') {
    if (piece.color === 'w') {
      rights.wK = false;
      rights.wQ = false;
    } else {
      rights.bK = false;
      rights.bQ = false;
    }
  }
  if (move.from === sq(0, 0) || move.to === sq(0, 0)) rights.wQ = false;
  if (move.from === sq(7, 0) || move.to === sq(7, 0)) rights.wK = false;
  if (move.from === sq(0, 7) || move.to === sq(0, 7)) rights.bQ = false;
  if (move.from === sq(7, 7) || move.to === sq(7, 7)) rights.bK = false;
  next.castling = rights;

  // en passant target
  if (piece.type === 'p' && Math.abs(rankOf(move.to) - rankOf(move.from)) === 2) {
    next.enPassant = sq(fileOf(move.from), (rankOf(move.from) + rankOf(move.to)) / 2);
  } else {
    next.enPassant = null;
  }

  if (piece.type === 'p' || move.captured) next.halfmove = 0;
  else next.halfmove += 1;

  if (piece.color === 'b') next.fullmove += 1;
  next.sideToMove = opposite(piece.color);

  return next;
}

export function getLegalMoves(state: GameState, from?: Square): Move[] {
  const color = state.sideToMove;
  const pseudo = generatePseudoMoves(state, color).filter((m) =>
    from === undefined ? true : m.from === from,
  );
  const legal: Move[] = [];
  for (const m of pseudo) {
    const next = applyMoveRaw(state, m);
    if (!inCheck(next, color)) legal.push(m);
  }
  return legal;
}

export function getAllLegalMoves(state: GameState): Move[] {
  return getLegalMoves(state);
}

function isInsufficientMaterial(board: Board): boolean {
  const pieces: Piece[] = [];
  for (const p of board) if (p) pieces.push(p);
  if (pieces.length === 2) return true; // K vs K
  if (pieces.length === 3) {
    return pieces.some((p) => p.type === 'b' || p.type === 'n');
  }
  return false;
}

function resolveStatus(state: GameState): GameState {
  const next = cloneState(state);
  const legal = getAllLegalMoves(next);
  const checked = inCheck(next, next.sideToMove);

  if (isInsufficientMaterial(next.board)) {
    next.status = 'draw';
    next.winner = null;
    return next;
  }

  if (legal.length === 0) {
    if (checked) {
      next.status = 'checkmate';
      next.winner = opposite(next.sideToMove);
    } else {
      next.status = 'stalemate';
      next.winner = null;
    }
    return next;
  }

  next.status = checked ? 'check' : 'playing';
  next.winner = null;
  return next;
}

export function applyMove(state: GameState, move: Move): GameState {
  const legal = getLegalMoves(state, move.from).find(
    (m) =>
      m.to === move.to &&
      (m.promotion ?? 'q') === (move.promotion ?? m.promotion ?? 'q'),
  );
  if (!legal) return state;
  const raw = applyMoveRaw(state, legal);
  return resolveStatus(raw);
}

export function getGameResult(state: GameState): {
  status: GameStatus;
  winner: Color | null;
} {
  return { status: state.status, winner: state.winner };
}

export function movesEqual(a: Move, b: Move): boolean {
  return a.from === b.from && a.to === b.to && (a.promotion ?? null) === (b.promotion ?? null);
}
