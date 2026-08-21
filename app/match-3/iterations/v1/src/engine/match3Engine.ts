import { COLS, GEM_TYPES, ROWS, SCORE } from '../constants/game';

export type GemType = 0 | 1 | 2 | 3 | 4;
export type Board = GemType[][];
export type Cell = { r: number; c: number };
export type HintMove = { a: Cell; b: Cell };
export type LevelStatus = 'playing' | 'won' | 'lost';

export type GameState = {
  board: Board;
  score: number;
  movesLeft: number;
  minScore: number;
  panicUsesLeft: number;
  status: LevelStatus;
  combo: number;
};

export type Rng = () => number;

const defaultRng: Rng = () => Math.random();

function cloneBoard(board: Board): Board {
  return board.map((row) => row.slice() as GemType[]);
}

function randomGem(rng: Rng): GemType {
  return Math.floor(rng() * GEM_TYPES) as GemType;
}

/** Avoid immediate 3-matches when placing a gem. */
function safeGem(board: Board, r: number, c: number, rng: Rng): GemType {
  for (let attempt = 0; attempt < 20; attempt++) {
    const g = randomGem(rng);
    const left1 = c > 0 ? board[r]![c - 1] : undefined;
    const left2 = c > 1 ? board[r]![c - 2] : undefined;
    if (left1 !== undefined && left1 === left2 && left1 === g) continue;
    const up1 = r > 0 ? board[r - 1]![c] : undefined;
    const up2 = r > 1 ? board[r - 2]![c] : undefined;
    if (up1 !== undefined && up1 === up2 && up1 === g) continue;
    return g;
  }
  return randomGem(rng);
}

export function createBoard(rng: Rng = defaultRng): Board {
  const board: Board = [];
  for (let r = 0; r < ROWS; r++) {
    const row: GemType[] = [];
    for (let c = 0; c < COLS; c++) {
      row.push(0);
    }
    board.push(row);
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      board[r]![c] = safeGem(board, r, c, rng);
    }
  }
  return board;
}

export function createGame(
  moves: number,
  minScore: number,
  panicUses: number,
  rng: Rng = defaultRng,
): GameState {
  return {
    board: createBoard(rng),
    score: 0,
    movesLeft: moves,
    minScore,
    panicUsesLeft: panicUses,
    status: 'playing',
    combo: 0,
  };
}

export function findMatches(board: Board): Cell[] {
  const marked = new Set<string>();
  const key = (r: number, c: number) => `${r},${c}`;

  for (let r = 0; r < ROWS; r++) {
    let run = 1;
    for (let c = 1; c <= COLS; c++) {
      const same =
        c < COLS && board[r]![c] === board[r]![c - 1];
      if (same) {
        run++;
      } else {
        if (run >= 3) {
          for (let k = 0; k < run; k++) marked.add(key(r, c - 1 - k));
        }
        run = 1;
      }
    }
  }

  for (let c = 0; c < COLS; c++) {
    let run = 1;
    for (let r = 1; r <= ROWS; r++) {
      const same =
        r < ROWS && board[r]![c] === board[r - 1]![c];
      if (same) {
        run++;
      } else {
        if (run >= 3) {
          for (let k = 0; k < run; k++) marked.add(key(r - 1 - k, c));
        }
        run = 1;
      }
    }
  }

  return [...marked].map((s) => {
    const [r, c] = s.split(',').map(Number);
    return { r: r!, c: c! };
  });
}

function scoreForMatchSize(n: number): number {
  if (n >= 5) return SCORE.match5 * n;
  if (n === 4) return SCORE.match4 * n;
  return SCORE.match3 * n;
}

/** Group matched cells into contiguous runs roughly by counting size buckets. */
function scoreMatches(cells: Cell[], combo: number): number {
  if (cells.length === 0) return 0;
  const base = scoreForMatchSize(Math.min(Math.max(cells.length, 3), 5));
  // Scale by how many cells cleared relative to a triple.
  const scaled = Math.round((base * cells.length) / 3);
  const mult = Math.pow(SCORE.cascadeMultiplier, Math.max(0, combo));
  return Math.round(scaled * mult);
}

export function applyGravity(board: Board): Board {
  const next = cloneBoard(board);
  for (let c = 0; c < COLS; c++) {
    const stack: GemType[] = [];
    for (let r = ROWS - 1; r >= 0; r--) {
      const v = next[r]![c];
      if (v !== undefined && (v as number) !== -1) stack.push(v);
    }
    for (let r = ROWS - 1; r >= 0; r--) {
      next[r]![c] = (stack.length ? stack.shift()! : (-1 as unknown as GemType));
    }
  }
  return next;
}

export function refill(board: Board, rng: Rng = defaultRng): Board {
  const next = cloneBoard(board);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if ((next[r]![c] as number) === -1) {
        next[r]![c] = randomGem(rng);
      }
    }
  }
  return next;
}

export function clearCells(board: Board, cells: Cell[]): Board {
  const next = cloneBoard(board);
  for (const { r, c } of cells) {
    next[r]![c] = -1 as unknown as GemType;
  }
  return next;
}

export function resolveOnce(
  state: GameState,
  rng: Rng = defaultRng,
): GameState {
  const matches = findMatches(state.board);
  if (matches.length === 0) {
    return { ...state, combo: 0 };
  }
  const gained = scoreMatches(matches, state.combo);
  let board = clearCells(state.board, matches);
  board = applyGravity(board);
  board = refill(board, rng);
  return {
    ...state,
    board,
    score: state.score + gained,
    combo: state.combo + 1,
  };
}

/** Resolve cascades until stable; does not change status/moves. */
export function resolveAll(
  state: GameState,
  rng: Rng = defaultRng,
  maxSteps = 40,
): GameState {
  let s = { ...state, combo: 0 };
  for (let i = 0; i < maxSteps; i++) {
    if (findMatches(s.board).length === 0) {
      return { ...s, combo: 0 };
    }
    s = resolveOnce(s, rng);
  }
  return { ...s, combo: 0 };
}

function adjacent(a: Cell, b: Cell): boolean {
  return (
    (a.r === b.r && Math.abs(a.c - b.c) === 1) ||
    (a.c === b.c && Math.abs(a.r - b.r) === 1)
  );
}

export function trySwap(
  state: GameState,
  a: Cell,
  b: Cell,
  rng: Rng = defaultRng,
): GameState {
  if (state.status !== 'playing') return state;
  if (!adjacent(a, b)) return state;

  const board = cloneBoard(state.board);
  const tmp = board[a.r]![a.c]!;
  board[a.r]![a.c] = board[b.r]![b.c]!;
  board[b.r]![b.c] = tmp;

  if (findMatches(board).length === 0) {
    return state;
  }

  let next: GameState = {
    ...state,
    board,
    movesLeft: state.movesLeft - 1,
    combo: 0,
  };
  next = resolveAll(next, rng);
  return evaluateEnd(next);
}

export function evaluateEnd(state: GameState): GameState {
  if (state.status !== 'playing') return state;
  if (state.score >= state.minScore) {
    return { ...state, status: 'won' };
  }
  if (state.movesLeft <= 0) {
    return { ...state, status: 'lost' };
  }
  return state;
}

export function hasValidMoves(board: Board): boolean {
  return findHintMove(board) !== null;
}

export function findHintMove(board: Board): HintMove | null {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const neighbors: Cell[] = [];
      if (c + 1 < COLS) neighbors.push({ r, c: c + 1 });
      if (r + 1 < ROWS) neighbors.push({ r: r + 1, c });
      for (const n of neighbors) {
        const trial = cloneBoard(board);
        const tmp = trial[r]![c]!;
        trial[r]![c] = trial[n.r]![n.c]!;
        trial[n.r]![n.c] = tmp;
        if (findMatches(trial).length > 0) {
          return { a: { r, c }, b: n };
        }
      }
    }
  }
  return null;
}

export function reshuffle(board: Board, rng: Rng = defaultRng): Board {
  for (let attempt = 0; attempt < 80; attempt++) {
    const flat: GemType[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) flat.push(board[r]![c]!);
    }
    // Fisher–Yates
    for (let i = flat.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const t = flat[i]!;
      flat[i] = flat[j]!;
      flat[j] = t;
    }
    const next: Board = [];
    let i = 0;
    for (let r = 0; r < ROWS; r++) {
      const row: GemType[] = [];
      for (let c = 0; c < COLS; c++) row.push(flat[i++]!);
      next.push(row);
    }
    if (findMatches(next).length === 0 && hasValidMoves(next)) {
      return next;
    }
  }
  // Fallback: fresh board without matches
  return createBoard(rng);
}

export function usePanic(
  state: GameState,
  rng: Rng = defaultRng,
): GameState {
  if (state.status !== 'playing') return state;
  if (state.panicUsesLeft <= 0 && hasValidMoves(state.board)) return state;
  const board = reshuffle(state.board, rng);
  return {
    ...state,
    board,
    panicUsesLeft: Math.max(0, state.panicUsesLeft - 1),
  };
}
