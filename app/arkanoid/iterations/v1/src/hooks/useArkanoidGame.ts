import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BALL_LOST_PAUSE_MS,
  INITIAL_LIVES,
  MAX_DT_MS,
} from '../constants/game';
import {
  createWorld,
  launchBall,
  resetBallOnPaddle,
  setPaddleX,
  step,
  WorldState,
} from '../engine/arkanoidEngine';
import { considerHighScore, scoreForBrick } from '../engine/arkanoidScore';
import { loadLevel } from '../engine/brickField';
import { onLevelCleared } from '../engine/levelProgress';
import { onBallLost } from '../engine/livesSystem';
import { loadHighScore, saveHighScore } from '../storage/offlineProgress';

export type GameStatus =
  | 'menu'
  | 'playing'
  | 'paused'
  | 'ballLost'
  | 'levelClear'
  | 'gameOver'
  | 'victory';

export type ArkanoidGameApi = {
  status: GameStatus;
  world: WorldState | null;
  lives: number;
  score: number;
  levelIndex: number;
  highScore: number;
  highScoreLoaded: boolean;
  startGame: () => void;
  setPaddleCenter: (x: number) => void;
  launch: () => void;
  pause: () => void;
  resume: () => void;
  continueAfterLevelClear: () => void;
  refreshHighScore: () => Promise<void>;
};

export function useArkanoidGame(): ArkanoidGameApi {
  const [status, setStatus] = useState<GameStatus>('menu');
  const [world, setWorld] = useState<WorldState | null>(null);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [score, setScore] = useState(0);
  const [levelIndex, setLevelIndex] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [highScoreLoaded, setHighScoreLoaded] = useState(false);

  const statusRef = useRef(status);
  const worldRef = useRef(world);
  const livesRef = useRef(lives);
  const scoreRef = useRef(score);
  const levelRef = useRef(levelIndex);
  const highScoreRef = useRef(0);
  const lastTsRef = useRef<number | null>(null);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);
  useEffect(() => {
    worldRef.current = world;
  }, [world]);
  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    levelRef.current = levelIndex;
  }, [levelIndex]);
  useEffect(() => {
    highScoreRef.current = highScore;
  }, [highScore]);

  const refreshHighScore = useCallback(async () => {
    const hs = await loadHighScore();
    setHighScore(hs);
    highScoreRef.current = hs;
    setHighScoreLoaded(true);
  }, []);

  useEffect(() => {
    void refreshHighScore();
  }, [refreshHighScore]);

  const persistEnd = useCallback(async (finalScore: number, nextStatus: GameStatus) => {
    const nextHigh = considerHighScore(finalScore, highScoreRef.current);
    setHighScore(nextHigh);
    highScoreRef.current = nextHigh;
    await saveHighScore(nextHigh);
    setStatus(nextStatus);
  }, []);

  const startGame = useCallback(() => {
    const bricks = loadLevel(0);
    const next = createWorld(bricks);
    setWorld(next);
    worldRef.current = next;
    setLives(INITIAL_LIVES);
    livesRef.current = INITIAL_LIVES;
    setScore(0);
    scoreRef.current = 0;
    setLevelIndex(0);
    levelRef.current = 0;
    lastTsRef.current = null;
    setStatus('playing');
  }, []);

  const setPaddleCenter = useCallback((x: number) => {
    if (statusRef.current !== 'playing' && statusRef.current !== 'ballLost') return;
    const current = worldRef.current;
    if (!current) return;
    const next = setPaddleX(current, x);
    setWorld(next);
    worldRef.current = next;
  }, []);

  const launch = useCallback(() => {
    if (statusRef.current !== 'playing') return;
    const current = worldRef.current;
    if (!current || current.ball.launched) return;
    const next = launchBall(current);
    setWorld(next);
    worldRef.current = next;
  }, []);

  const pause = useCallback(() => {
    if (statusRef.current !== 'playing') return;
    setStatus('paused');
  }, []);

  const resume = useCallback(() => {
    if (statusRef.current !== 'paused') return;
    lastTsRef.current = null;
    setStatus('playing');
  }, []);

  const continueAfterLevelClear = useCallback(() => {
    if (statusRef.current !== 'levelClear') return;
    const idx = levelRef.current;
    const bricks = loadLevel(idx);
    const next = createWorld(bricks);
    setWorld(next);
    worldRef.current = next;
    lastTsRef.current = null;
    setStatus('playing');
  }, []);

  useEffect(() => {
    if (status !== 'playing') return;

    let raf = 0;
    const tick = (ts: number) => {
      const prev = lastTsRef.current;
      lastTsRef.current = ts;
      const dt = prev == null ? 16 : Math.min(ts - prev, MAX_DT_MS);

      const current = worldRef.current;
      if (!current) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const result = step(current, dt);
      setWorld(result.state);
      worldRef.current = result.state;

      if (result.destroyedBrick) {
        const delta = scoreForBrick(result.destroyedBrick.type);
        const nextScore = scoreRef.current + delta;
        scoreRef.current = nextScore;
        setScore(nextScore);
      }

      if (result.events.includes('levelCleared')) {
        const advance = onLevelCleared(levelRef.current);
        if (advance.victory) {
          void persistEnd(scoreRef.current, 'victory');
          return;
        }
        levelRef.current = advance.levelIndex;
        setLevelIndex(advance.levelIndex);
        setStatus('levelClear');
        return;
      }

      if (result.events.includes('ballLost')) {
        const { lives: nextLives, gameOver } = onBallLost(livesRef.current);
        setLives(nextLives);
        livesRef.current = nextLives;

        if (gameOver) {
          void persistEnd(scoreRef.current, 'gameOver');
          return;
        }

        setStatus('ballLost');
        setTimeout(() => {
          const w = worldRef.current;
          if (!w) return;
          const reset = resetBallOnPaddle(w);
          setWorld(reset);
          worldRef.current = reset;
          lastTsRef.current = null;
          setStatus('playing');
        }, BALL_LOST_PAUSE_MS);
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [status, persistEnd]);

  return {
    status,
    world,
    lives,
    score,
    levelIndex,
    highScore,
    highScoreLoaded,
    startGame,
    setPaddleCenter,
    launch,
    pause,
    resume,
    continueAfterLevelClear,
    refreshHighScore,
  };
}
