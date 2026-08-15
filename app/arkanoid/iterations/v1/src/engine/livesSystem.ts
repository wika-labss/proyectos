import { INITIAL_LIVES } from '../constants/game';

export type LivesResult = {
  lives: number;
  gameOver: boolean;
};

export function createLives(initial: number = INITIAL_LIVES): number {
  return initial;
}

/** Apply ball lost: lose one life. Game over when lives reach 0. */
export function onBallLost(lives: number): LivesResult {
  const next = Math.max(0, lives - 1);
  return { lives: next, gameOver: next === 0 };
}
