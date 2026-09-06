import { INITIAL_LIVES, MAX_LIVES } from '../constants/game';

export type LivesResult = {
  lives: number;
  gameOver: boolean;
};

export function createLives(initial: number = INITIAL_LIVES): number {
  return initial;
}

/** Apply a lost ball: lose one life. Game over when lives reach 0. */
export function onBallLost(lives: number): LivesResult {
  const next = Math.max(0, lives - 1);
  return { lives: next, gameOver: next === 0 };
}

/** P (Player) capsule: one extra life, capped. */
export function onExtraLife(lives: number): number {
  return Math.min(MAX_LIVES, lives + 1);
}
