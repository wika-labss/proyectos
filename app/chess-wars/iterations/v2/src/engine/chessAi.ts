import { applyMove, getAllLegalMoves, inCheck } from './chessEngine';
import { AiDifficulty, Color, GameState, Move, PieceType } from './types';

const MATERIAL: Record<PieceType, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

function evaluate(state: GameState, perspective: Color): number {
  let score = 0;
  for (const p of state.board) {
    if (!p) continue;
    const v = MATERIAL[p.type];
    score += p.color === perspective ? v : -v;
  }
  // mobility
  const myMoves = getAllLegalMoves({ ...state, sideToMove: perspective }).length;
  const opp = perspective === 'w' ? 'b' : 'w';
  const oppMoves = getAllLegalMoves({ ...state, sideToMove: opp }).length;
  score += 2 * (myMoves - oppMoves);

  if (state.status === 'checkmate') {
    if (state.winner === perspective) score += 100000;
    else score -= 100000;
  } else if (state.status === 'stalemate' || state.status === 'draw') {
    score = 0;
  } else if (inCheck(state, opp)) {
    score += 15;
  }
  return score;
}

function minimax(
  state: GameState,
  depth: number,
  maximizing: boolean,
  perspective: Color,
  alpha: number,
  beta: number,
): number {
  if (depth === 0 || state.status === 'checkmate' || state.status === 'stalemate' || state.status === 'draw') {
    return evaluate(state, perspective);
  }

  const moves = getAllLegalMoves(state);
  if (moves.length === 0) return evaluate(state, perspective);

  if (maximizing) {
    let best = -Infinity;
    for (const m of moves) {
      const next = applyMove(state, m);
      const val = minimax(next, depth - 1, false, perspective, alpha, beta);
      best = Math.max(best, val);
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  }

  let best = Infinity;
  for (const m of moves) {
    const next = applyMove(state, m);
    const val = minimax(next, depth - 1, true, perspective, alpha, beta);
    best = Math.min(best, val);
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function chooseAiMove(state: GameState, difficulty: AiDifficulty): Move | null {
  const moves = getAllLegalMoves(state);
  if (moves.length === 0) return null;

  const perspective = state.sideToMove;
  const depth = difficulty === 'easy' ? 1 : 2;

  if (difficulty === 'easy' && Math.random() < 0.35) {
    return shuffle(moves)[0];
  }

  let bestScore = -Infinity;
  let bestMoves: Move[] = [];

  for (const m of shuffle(moves)) {
    const next = applyMove(state, m);
    const score = minimax(next, depth - 1, false, perspective, -Infinity, Infinity);
    const noisy = difficulty === 'easy' ? score + (Math.random() * 40 - 20) : score;
    if (noisy > bestScore + 1e-6) {
      bestScore = noisy;
      bestMoves = [m];
    } else if (Math.abs(noisy - bestScore) <= 1e-6) {
      bestMoves.push(m);
    }
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)] ?? moves[0];
}
