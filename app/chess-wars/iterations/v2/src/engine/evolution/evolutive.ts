import {
  applyMove,
  createInitialState,
  getAllLegalMoves,
  getLegalMoves,
} from '../chessEngine';
import {
  EvolutionBranch,
  EvolutiveState,
  LoadoutId,
  Move,
  PieceRuntime,
  PieceType,
  Square,
  fileOf,
  rankOf,
  squareKey,
} from '../types';
import { isEnergyNode } from './nodes';

export const XP_THRESHOLD = 3;
export const EVOLVE_COST = 2;
export const MAX_ENERGY = 5;

const EVOLVABLE: Partial<Record<PieceType, EvolutionBranch>> = {
  p: 'drone',
  r: 'fortress',
  n: 'interceptor',
};

function defaultRuntime(): PieceRuntime {
  return { xp: 0, evolved: null, abilityAvailable: false, fortifiedTurns: 0 };
}

function cloneEvo(state: EvolutiveState): EvolutiveState {
  const pieces: Record<string, PieceRuntime> = {};
  for (const [k, v] of Object.entries(state.pieces)) {
    pieces[k] = { ...v };
  }
  return {
    ...state,
    base: {
      ...state.base,
      board: state.base.board.map((p) => (p ? { ...p } : null)),
      castling: { ...state.base.castling },
    },
    pieces,
  };
}

export function createEvolutiveState(loadout: LoadoutId): EvolutiveState {
  const base = createInitialState();
  const pieces: Record<string, PieceRuntime> = {};
  for (let i = 0; i < 64; i++) {
    if (base.board[i]) pieces[squareKey(i)] = defaultRuntime();
  }
  return {
    base,
    energy: loadout === 'A' ? 1 : 0,
    maxEnergy: MAX_ENERGY,
    pieces,
    loadout,
    pendingInterceptorFrom: null,
  };
}

function remappedPieces(
  pieces: Record<string, PieceRuntime>,
  from: Square,
  to: Square,
  capturedKey?: string,
): Record<string, PieceRuntime> {
  const next = { ...pieces };
  const moving = next[squareKey(from)] ?? defaultRuntime();
  delete next[squareKey(from)];
  if (capturedKey) delete next[capturedKey];
  next[squareKey(to)] = { ...moving };
  return next;
}

function tickFortification(pieces: Record<string, PieceRuntime>): Record<string, PieceRuntime> {
  const next: Record<string, PieceRuntime> = {};
  for (const [k, v] of Object.entries(pieces)) {
    next[k] = { ...v, fortifiedTurns: Math.max(0, v.fortifiedTurns - 1) };
  }
  return next;
}

export function isFortified(state: EvolutiveState, square: Square): boolean {
  const rt = state.pieces[squareKey(square)];
  return !!rt && rt.fortifiedTurns > 0;
}

export function getBranchForType(type: PieceType): EvolutionBranch | null {
  return EVOLVABLE[type] ?? null;
}

export function canEvolve(state: EvolutiveState, square: Square): boolean {
  const piece = state.base.board[square];
  if (!piece || piece.color !== state.base.sideToMove) return false;
  if (!getBranchForType(piece.type)) return false;
  const rt = state.pieces[squareKey(square)] ?? defaultRuntime();
  return !rt.evolved && rt.xp >= XP_THRESHOLD && state.energy >= EVOLVE_COST;
}

export function evolve(state: EvolutiveState, square: Square): EvolutiveState | null {
  if (!canEvolve(state, square)) return null;
  const piece = state.base.board[square]!;
  const branch = getBranchForType(piece.type)!;
  const next = cloneEvo(state);
  next.energy -= EVOLVE_COST;
  const key = squareKey(square);
  next.pieces[key] = {
    ...(next.pieces[key] ?? defaultRuntime()),
    evolved: branch,
    abilityAvailable: true,
  };
  return next;
}

export function droneTargets(state: EvolutiveState, from: Square): Square[] {
  const rt = state.pieces[squareKey(from)];
  if (!rt || rt.evolved !== 'drone' || !rt.abilityAvailable) return [];
  const f = fileOf(from);
  const r = rankOf(from);
  const out: Square[] = [];
  for (const [df, dr] of [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ] as const) {
    for (let dist = 1; dist <= 2; dist++) {
      const tf = f + df * dist;
      const tr = r + dr * dist;
      if (tf < 0 || tf > 7 || tr < 0 || tr > 7) break;
      const to = tr * 8 + tf;
      if (state.base.board[to]) break;
      out.push(to);
    }
  }
  return out;
}

export function useDroneTeleport(
  state: EvolutiveState,
  from: Square,
  to: Square,
): EvolutiveState | null {
  if (!droneTargets(state, from).includes(to)) return null;
  const next = cloneEvo(state);
  const piece = next.base.board[from];
  if (!piece) return null;
  next.base.board[from] = null;
  next.base.board[to] = piece;
  next.pieces = remappedPieces(next.pieces, from, to);
  const key = squareKey(to);
  next.pieces[key] = { ...next.pieces[key], abilityAvailable: false };
  if (isEnergyNode(to)) {
    next.energy = Math.min(MAX_ENERGY, next.energy + 1);
    next.pieces[key].xp += 1;
  }
  next.base.sideToMove = next.base.sideToMove === 'w' ? 'b' : 'w';
  next.pieces = tickFortification(next.pieces);
  next.pendingInterceptorFrom = null;
  return next;
}

export function activateFortress(state: EvolutiveState, square: Square): EvolutiveState | null {
  const rt = state.pieces[squareKey(square)];
  const piece = state.base.board[square];
  if (!piece || !rt || rt.evolved !== 'fortress' || !rt.abilityAvailable) return null;
  if (piece.color !== state.base.sideToMove) return null;
  const next = cloneEvo(state);
  const key = squareKey(square);
  next.pieces[key] = {
    ...next.pieces[key],
    abilityAvailable: false,
    fortifiedTurns: 2,
  };
  return next;
}

export function filterLegalMoves(state: EvolutiveState): Move[] {
  return getAllLegalMoves(state.base).filter((m) => !m.captured || !isFortified(state, m.to));
}

export function filterLegalMovesFrom(state: EvolutiveState, from: Square): Move[] {
  return filterLegalMoves(state).filter((m) => m.from === from);
}

function applyXpEnergy(next: EvolutiveState, legal: Move, to: Square): void {
  const toKey = squareKey(to);
  const rt = next.pieces[toKey] ?? defaultRuntime();
  let xpGain = legal.captured ? 2 : 0;
  if (next.loadout === 'B' && legal.captured) xpGain += 1;
  if (isEnergyNode(to)) {
    next.energy = Math.min(MAX_ENERGY, next.energy + 1);
    xpGain += 1;
  }
  next.pieces[toKey] = { ...rt, xp: rt.xp + xpGain };
}

/**
 * Apply a normal chess move in evolutive mode.
 * If the mover is Interceptor with ability and player wants extra jump,
 * call `armInterceptorExtra` afterwards (UI) OR pass `armInterceptor=true`.
 */
export function applyEvolutiveMove(
  state: EvolutiveState,
  move: Move,
  opts?: { armInterceptor?: boolean },
): EvolutiveState | null {
  if (state.pendingInterceptorFrom !== null) {
    return completeInterceptorJump(state, move.to);
  }

  const legal = filterLegalMovesFrom(state, move.from).find((m) => m.to === move.to);
  if (!legal) return null;

  const next = cloneEvo(state);
  const capturedKey = legal.captured ? squareKey(legal.to) : undefined;
  const sideBefore = next.base.sideToMove;
  next.base = applyMove(next.base, legal);
  next.pieces = remappedPieces(next.pieces, legal.from, legal.to, capturedKey);
  applyXpEnergy(next, legal, legal.to);

  const toKey = squareKey(legal.to);
  const movedRt = next.pieces[toKey];
  const wantExtra =
    opts?.armInterceptor &&
    movedRt?.evolved === 'interceptor' &&
    movedRt.abilityAvailable;

  if (wantExtra) {
    // Keep same side to move for second knight jump
    next.base.sideToMove = sideBefore;
    next.pendingInterceptorFrom = legal.to;
    // Don't tick fortification until turn fully ends
    return next;
  }

  next.pendingInterceptorFrom = null;
  next.pieces = tickFortification(next.pieces);
  return next;
}

export function completeInterceptorJump(state: EvolutiveState, to: Square): EvolutiveState | null {
  if (state.pendingInterceptorFrom === null) return null;
  const from = state.pendingInterceptorFrom;
  const legal = getLegalMoves(state.base, from).find(
    (m) => m.to === to && (!m.captured || !isFortified(state, m.to)),
  );
  if (!legal) return null;

  const next = cloneEvo(state);
  const capturedKey = legal.captured ? squareKey(legal.to) : undefined;
  next.base = applyMove(next.base, legal);
  next.pieces = remappedPieces(next.pieces, from, to, capturedKey);
  applyXpEnergy(next, legal, to);
  const toKey = squareKey(to);
  next.pieces[toKey] = {
    ...(next.pieces[toKey] ?? defaultRuntime()),
    abilityAvailable: false,
  };
  next.pendingInterceptorFrom = null;
  next.pieces = tickFortification(next.pieces);
  return next;
}

export function skipInterceptorExtra(state: EvolutiveState): EvolutiveState {
  if (state.pendingInterceptorFrom === null) return state;
  const from = state.pendingInterceptorFrom;
  const next = cloneEvo(state);
  const piece = next.base.board[from];
  if (piece && next.base.sideToMove === piece.color) {
    next.base.sideToMove = piece.color === 'w' ? 'b' : 'w';
  }
  next.pendingInterceptorFrom = null;
  next.pieces = tickFortification(next.pieces);
  return next;
}

export function interceptorExtraTargets(state: EvolutiveState): Square[] {
  if (state.pendingInterceptorFrom === null) return [];
  return getLegalMoves(state.base, state.pendingInterceptorFrom)
    .filter((m) => !m.captured || !isFortified(state, m.to))
    .map((m) => m.to);
}
