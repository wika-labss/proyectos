import { SCORE_PER_SECOND } from '../constants/game';

export type ScoreClock = {
  startedAtMs: number;
  pausedAtMs: number | null;
  accumulatedPausedMs: number;
};

export function startRun(nowMs: number): ScoreClock {
  return {
    startedAtMs: nowMs,
    pausedAtMs: null,
    accumulatedPausedMs: 0,
  };
}

export function pauseClock(clock: ScoreClock, nowMs: number): ScoreClock {
  if (clock.pausedAtMs !== null) return clock;
  return { ...clock, pausedAtMs: nowMs };
}

export function resumeClock(clock: ScoreClock, nowMs: number): ScoreClock {
  if (clock.pausedAtMs === null) return clock;
  return {
    ...clock,
    accumulatedPausedMs: clock.accumulatedPausedMs + (nowMs - clock.pausedAtMs),
    pausedAtMs: null,
  };
}

export function elapsedAliveSeconds(clock: ScoreClock, nowMs: number): number {
  const pauseTail =
    clock.pausedAtMs !== null ? nowMs - clock.pausedAtMs : 0;
  const aliveMs = nowMs - clock.startedAtMs - clock.accumulatedPausedMs - pauseTail;
  return Math.max(0, aliveMs / 1000);
}

export function tickScore(clock: ScoreClock, nowMs: number): number {
  return Math.floor(elapsedAliveSeconds(clock, nowMs) * SCORE_PER_SECOND);
}

export function considerHighScore(score: number, highScore: number): number {
  return Math.max(score, highScore);
}
