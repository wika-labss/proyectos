import { chooseAiMove } from '../chessAi';
import { AiDifficulty, EvolutiveState, Move, Square } from '../types';
import {
  applyEvolutiveMove,
  canEvolve,
  evolve,
  filterLegalMoves,
} from './evolutive';

/**
 * AI for evolutive mode: optional cheap evolve, then legal base move via material AI.
 */
export function chooseEvolutiveAiAction(
  state: EvolutiveState,
  difficulty: AiDifficulty,
): { kind: 'evolve'; square: Square } | { kind: 'move'; move: Move } | null {
  // ~25% chance to evolve a ready piece if energy allows
  if (Math.random() < 0.25) {
    const candidates: Square[] = [];
    for (let sq = 0; sq < 64; sq++) {
      if (canEvolve(state, sq)) candidates.push(sq);
    }
    if (candidates.length) {
      return {
        kind: 'evolve',
        square: candidates[Math.floor(Math.random() * candidates.length)],
      };
    }
  }

  const legal = filterLegalMoves(state);
  if (!legal.length) return null;

  // Reuse classic AI on base, then map to a filtered legal move
  const pick = chooseAiMove(state.base, difficulty);
  if (pick && legal.some((m) => m.from === pick.from && m.to === pick.to)) {
    return { kind: 'move', move: pick };
  }
  return { kind: 'move', move: legal[Math.floor(Math.random() * legal.length)] };
}

export function applyEvolutiveAiAction(
  state: EvolutiveState,
  difficulty: AiDifficulty,
): EvolutiveState | null {
  const action = chooseEvolutiveAiAction(state, difficulty);
  if (!action) return null;
  if (action.kind === 'evolve') {
    const evolved = evolve(state, action.square);
    if (!evolved) return null;
    // After evolving, still need to move
    const moveAction = chooseEvolutiveAiAction(evolved, difficulty);
    if (!moveAction || moveAction.kind !== 'move') return evolved;
    return applyEvolutiveMove(evolved, moveAction.move) ?? evolved;
  }
  return applyEvolutiveMove(state, action.move);
}
