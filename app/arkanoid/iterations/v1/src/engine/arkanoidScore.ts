import { SCORE_HARD, SCORE_NORMAL } from '../constants/game';
import { BrickType } from './brickField';

export function scoreForBrick(type: BrickType): number {
  return type === 'hard' ? SCORE_HARD : SCORE_NORMAL;
}

export function considerHighScore(score: number, highScore: number): number {
  return Math.max(score, highScore);
}
