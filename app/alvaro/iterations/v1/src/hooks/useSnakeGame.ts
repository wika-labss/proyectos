import { useCallback, useEffect, useRef, useState } from 'react';
import {
  GRID_HEIGHT,
  GRID_WIDTH,
  INITIAL_LIVES,
  LIFE_LOST_PAUSE_MS,
  TICK_MS,
} from '../constants/game';
import { onCollision } from '../engine/livesSystem';
import {
  createGame,
  Direction,
  EngineState,
  step,
} from '../engine/snakeEngine';
import {
  considerHighScore,
  pauseClock,
  resumeClock,
  ScoreClock,
  startRun,
  tickScore,
} from '../engine/survivalScore';
import { loadHighScore, saveHighScore } from '../storage/offlineProgress';

export type GameStatus = 'idle' | 'playing' | 'lifeLost' | 'paused' | 'gameOver';

export type SnakeGameApi = {
  status: GameStatus;
  engine: EngineState | null;
  lives: number;
  score: number;
  highScore: number;
  highScoreLoaded: boolean;
  startGame: () => void;
  queueDirection: (dir: Direction) => void;
  pause: () => void;
  resume: () => void;
  refreshHighScore: () => Promise<void>;
};

export function useSnakeGame(): SnakeGameApi {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [engine, setEngine] = useState<EngineState | null>(null);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [highScoreLoaded, setHighScoreLoaded] = useState(false);

  const statusRef = useRef(status);
  const engineRef = useRef(engine);
  const livesRef = useRef(lives);
  const pendingRef = useRef<Direction | undefined>(undefined);
  const clockRef = useRef<ScoreClock | null>(null);
  const highScoreRef = useRef(0);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);
  useEffect(() => {
    engineRef.current = engine;
  }, [engine]);
  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);
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

  const finishGameOver = useCallback(async (finalScore: number) => {
    const nextHigh = considerHighScore(finalScore, highScoreRef.current);
    setHighScore(nextHigh);
    highScoreRef.current = nextHigh;
    await saveHighScore(nextHigh);
    setStatus('gameOver');
  }, []);

  const startGame = useCallback(() => {
    const next = createGame(GRID_WIDTH, GRID_HEIGHT);
    setEngine(next);
    engineRef.current = next;
    setLives(INITIAL_LIVES);
    livesRef.current = INITIAL_LIVES;
    setScore(0);
    pendingRef.current = undefined;
    clockRef.current = startRun(Date.now());
    setStatus('playing');
  }, []);

  const queueDirection = useCallback((dir: Direction) => {
    if (statusRef.current !== 'playing') return;
    pendingRef.current = dir;
  }, []);

  const pause = useCallback(() => {
    if (statusRef.current !== 'playing' || !clockRef.current) return;
    clockRef.current = pauseClock(clockRef.current, Date.now());
    setStatus('paused');
  }, []);

  const resume = useCallback(() => {
    if (statusRef.current !== 'paused' || !clockRef.current) return;
    clockRef.current = resumeClock(clockRef.current, Date.now());
    setStatus('playing');
  }, []);

  useEffect(() => {
    if (status !== 'playing') return;

    const id = setInterval(() => {
      const current = engineRef.current;
      const clock = clockRef.current;
      if (!current || !clock) return;

      const pending = pendingRef.current;
      pendingRef.current = undefined;
      const result = step(current, pending);
      setEngine(result.state);
      engineRef.current = result.state;
      setScore(tickScore(clock, Date.now()));

      if (result.event === 'hitWall' || result.event === 'hitSelf') {
        const { lives: nextLives, gameOver } = onCollision(livesRef.current);
        setLives(nextLives);
        livesRef.current = nextLives;

        if (gameOver) {
          const finalScore = tickScore(clock, Date.now());
          setScore(finalScore);
          void finishGameOver(finalScore);
          return;
        }

        setStatus('lifeLost');
        clockRef.current = pauseClock(clock, Date.now());
        setTimeout(() => {
          const reset = createGame(GRID_WIDTH, GRID_HEIGHT);
          setEngine(reset);
          engineRef.current = reset;
          pendingRef.current = undefined;
          if (clockRef.current) {
            clockRef.current = resumeClock(clockRef.current, Date.now());
          }
          setStatus('playing');
        }, LIFE_LOST_PAUSE_MS);
        return;
      }

      if (result.event === 'boardFull') {
        const finalScore = tickScore(clock, Date.now());
        setScore(finalScore);
        void finishGameOver(finalScore);
      }
    }, TICK_MS);

    return () => clearInterval(id);
  }, [status, finishGameOver]);

  return {
    status,
    engine,
    lives,
    score,
    highScore,
    highScoreLoaded,
    startGame,
    queueDirection,
    pause,
    resume,
    refreshHighScore,
  };
}
