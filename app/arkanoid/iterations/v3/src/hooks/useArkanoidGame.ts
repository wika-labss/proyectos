import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BALL_LOST_PAUSE_MS,
  INITIAL_LIVES,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from '../constants/game';
import {
  createWorld,
  fireLasers,
  launchBall,
  resetBall,
  setPaddleX,
  step,
} from '../engine/arkanoidEngine';
import { considerHighScore, onBrickDestroyed } from '../engine/arkanoidScore';
import { onLevelCleared } from '../engine/levelProgress';
import { onBallLost, onExtraLife } from '../engine/livesSystem';
import type { WorldState } from '../engine/types';
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
  movePaddle: (worldX: number) => void;
  launch: () => void;
  pause: () => void;
  resume: () => void;
  continueLevel: () => void;
  goMenu: () => void;
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
  const highScoreRef = useRef(0);

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

  const persistHigh = useCallback(async (finalScore: number) => {
    const nextHigh = considerHighScore(finalScore, highScoreRef.current);
    setHighScore(nextHigh);
    highScoreRef.current = nextHigh;
    await saveHighScore(nextHigh);
  }, []);

  const finishLevel = useCallback(
    (fromIndex: number) => {
      const advance = onLevelCleared(fromIndex);
      if (advance.kind === 'victory') {
        void persistHigh(scoreRef.current);
        setStatus('victory');
        return;
      }
      setStatus('levelClear');
    },
    [persistHigh],
  );

  const startGame = useCallback(() => {
    const next = createWorld(WORLD_WIDTH, WORLD_HEIGHT, 0);
    setWorld(next);
    worldRef.current = next;
    setLives(INITIAL_LIVES);
    livesRef.current = INITIAL_LIVES;
    setScore(0);
    scoreRef.current = 0;
    setLevelIndex(0);
    setStatus('playing');
  }, []);

  const goMenu = useCallback(() => {
    setStatus('menu');
    setWorld(null);
    worldRef.current = null;
  }, []);

  const movePaddle = useCallback(
    (worldX: number) => {
      if (statusRef.current !== 'playing') return;
      const current = worldRef.current;
      if (!current) return;
      const next = setPaddleX(current, worldX - current.paddle.w / 2);
      setWorld(next);
      worldRef.current = next;
      if (next.doorExit) {
        finishLevel(next.levelIndex);
      }
    },
    [finishLevel],
  );

  const launch = useCallback(() => {
    if (statusRef.current !== 'playing') return;
    const current = worldRef.current;
    if (!current) return;
    let next = current.ball.launched ? current : launchBall(current);
    next = fireLasers(next);
    setWorld(next);
    worldRef.current = next;
  }, []);

  const pause = useCallback(() => {
    if (statusRef.current !== 'playing') return;
    setStatus('paused');
  }, []);

  const resume = useCallback(() => {
    if (statusRef.current !== 'paused') return;
    setStatus('playing');
  }, []);

  const continueLevel = useCallback(() => {
    if (statusRef.current !== 'levelClear') return;
    const nextIndex = levelIndex + 1;
    const next = createWorld(WORLD_WIDTH, WORLD_HEIGHT, nextIndex);
    setWorld(next);
    worldRef.current = next;
    setLevelIndex(nextIndex);
    setStatus('playing');
  }, [levelIndex]);

  useEffect(() => {
    if (status !== 'playing') return;
    let raf = 0;
    let last = Date.now();
    let alive = true;

    const loop = () => {
      if (!alive) return;
      const now = Date.now();
      const dt = now - last;
      last = now;
      const current = worldRef.current;
      if (current) {
        let ticking = current;
        if (current.power === 'laser' && current.ball.launched) {
          ticking = fireLasers(ticking);
        }
        const result = step(ticking, dt);
        setWorld(result.state);
        worldRef.current = result.state;

        for (const event of result.events) {
          if (event.type === 'brickDestroyed') {
            const nextScore = scoreRef.current + onBrickDestroyed(event.brickType);
            setScore(nextScore);
            scoreRef.current = nextScore;
          }
          if (event.type === 'extraLife') {
            const nextLives = onExtraLife(livesRef.current);
            setLives(nextLives);
            livesRef.current = nextLives;
          }
          if (event.type === 'ballLost') {
            const { lives: nextLives, gameOver } = onBallLost(livesRef.current);
            setLives(nextLives);
            livesRef.current = nextLives;
            if (gameOver) {
              void persistHigh(scoreRef.current);
              setStatus('gameOver');
              return;
            }
            setStatus('ballLost');
            setTimeout(() => {
              const parked = worldRef.current;
              if (!parked) return;
              const reset = resetBall(parked);
              setWorld(reset);
              worldRef.current = reset;
              setStatus('playing');
            }, BALL_LOST_PAUSE_MS);
            return;
          }
          if (event.type === 'cleared' || event.type === 'breakExit') {
            finishLevel(result.state.levelIndex);
            return;
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [status, persistHigh, finishLevel]);

  return {
    status,
    world,
    lives,
    score,
    levelIndex,
    highScore,
    highScoreLoaded,
    startGame,
    movePaddle,
    launch,
    pause,
    resume,
    continueLevel,
    goMenu,
    refreshHighScore,
  };
}
