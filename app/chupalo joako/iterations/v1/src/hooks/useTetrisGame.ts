import { useCallback, useEffect, useRef, useState } from 'react';
import { DT_CLAMP_MS, LOCK_DELAY_MS } from '../constants/game';
import { createBag, nextPiece, type BagState } from '../engine/pieceBag';
import { gravityMs, levelFromScore, softDropMs } from '../engine/scoreDifficulty';
import {
  considerHighScore,
  onHardDrop,
  onLinesCleared,
  onSoftDrop,
} from '../engine/tetrisScore';
import {
  Board,
  createBoard,
  hardDropDistance,
  lock,
  Piece,
  PieceType,
  spawn,
  tryMove,
  tryRotateCW,
} from '../engine/tetrisEngine';
import { loadHighScore, saveHighScore } from '../storage/offlineProgress';

export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameOver';

export type TetrisGameApi = {
  status: GameStatus;
  board: Board | null;
  active: Piece | null;
  preview: PieceType | null;
  score: number;
  level: number;
  gravityMs: number;
  highScore: number;
  highScoreLoaded: boolean;
  startGame: () => void;
  move: (dx: number) => void;
  rotate: () => void;
  setSoftDrop: (held: boolean) => void;
  hardDrop: () => void;
  pause: () => void;
  resume: () => void;
  refreshHighScore: () => Promise<void>;
};

type RunRefs = {
  board: Board;
  active: Piece;
  preview: PieceType;
  bag: BagState;
  score: number;
  grounded: boolean;
  gravityAcc: number;
  lockAcc: number;
  softDrop: boolean;
};

export function useTetrisGame(): TetrisGameApi {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [board, setBoard] = useState<Board | null>(null);
  const [active, setActive] = useState<Piece | null>(null);
  const [preview, setPreview] = useState<PieceType | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [highScoreLoaded, setHighScoreLoaded] = useState(false);

  const statusRef = useRef(status);
  const highScoreRef = useRef(0);
  const runRef = useRef<RunRefs | null>(null);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);
  useEffect(() => {
    highScoreRef.current = highScore;
  }, [highScore]);

  const publish = useCallback((run: RunRefs) => {
    setBoard(run.board);
    setActive(run.active);
    setPreview(run.preview);
    setScore(run.score);
  }, []);

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
    statusRef.current = 'gameOver';
  }, []);

  const spawnNext = useCallback(
    (run: RunRefs): boolean => {
      const taken = nextPiece(run.bag);
      run.bag = taken.bag;
      run.preview = taken.preview;
      const result = spawn(run.board, taken.piece);
      if (result.topOut || !result.piece) {
        run.active = run.active;
        publish(run);
        void finishGameOver(run.score);
        return false;
      }
      run.active = result.piece;
      run.grounded = false;
      run.lockAcc = 0;
      run.gravityAcc = 0;
      publish(run);
      return true;
    },
    [finishGameOver, publish]
  );

  const lockActive = useCallback(
    (run: RunRefs) => {
      const locked = lock(run.board, run.active);
      run.board = locked.board;
      run.score += onLinesCleared(locked.linesCleared);
      run.grounded = false;
      run.lockAcc = 0;
      run.gravityAcc = 0;
      spawnNext(run);
    },
    [spawnNext]
  );

  const startGame = useCallback(() => {
    const board0 = createBoard();
    const taken = nextPiece(createBag());
    const result = spawn(board0, taken.piece);
    if (result.topOut || !result.piece) return;
    const run: RunRefs = {
      board: board0,
      active: result.piece,
      preview: taken.preview,
      bag: taken.bag,
      score: 0,
      grounded: false,
      gravityAcc: 0,
      lockAcc: 0,
      softDrop: false,
    };
    runRef.current = run;
    publish(run);
    setStatus('playing');
    statusRef.current = 'playing';
  }, [publish]);

  const move = useCallback(
    (dx: number) => {
      const run = runRef.current;
      if (statusRef.current !== 'playing' || !run) return;
      const next = tryMove(run.board, run.active, dx, 0);
      if (!next) return;
      run.active = next;
      if (tryMove(run.board, run.active, 0, 1)) {
        run.grounded = false;
        run.lockAcc = 0;
      }
      publish(run);
    },
    [publish]
  );

  const rotate = useCallback(() => {
    const run = runRef.current;
    if (statusRef.current !== 'playing' || !run) return;
    const next = tryRotateCW(run.board, run.active);
    if (!next) return;
    run.active = next;
    if (tryMove(run.board, run.active, 0, 1)) {
      run.grounded = false;
      run.lockAcc = 0;
    } else {
      run.lockAcc = 0;
    }
    publish(run);
  }, [publish]);

  const setSoftDrop = useCallback((held: boolean) => {
    const run = runRef.current;
    if (!run) return;
    run.softDrop = held;
  }, []);

  const hardDrop = useCallback(() => {
    const run = runRef.current;
    if (statusRef.current !== 'playing' || !run) return;
    const dist = hardDropDistance(run.board, run.active);
    if (dist > 0) {
      const dropped = tryMove(run.board, run.active, 0, dist);
      if (dropped) run.active = dropped;
      run.score += onHardDrop(dist);
    }
    lockActive(run);
  }, [lockActive]);

  const pause = useCallback(() => {
    if (statusRef.current !== 'playing') return;
    setStatus('paused');
    statusRef.current = 'paused';
  }, []);

  const resume = useCallback(() => {
    if (statusRef.current !== 'paused') return;
    setStatus('playing');
    statusRef.current = 'playing';
  }, []);

  useEffect(() => {
    if (status !== 'playing') return;
    let last = Date.now();
    let raf = 0;

    const loop = () => {
      const run = runRef.current;
      if (statusRef.current !== 'playing' || !run) {
        raf = requestAnimationFrame(loop);
        return;
      }
      const now = Date.now();
      let dt = now - last;
      last = now;
      dt = Math.min(Math.max(dt, 0), DT_CLAMP_MS);

      const level = levelFromScore(run.score);
      const interval = run.softDrop ? softDropMs(level) : gravityMs(level);
      run.gravityAcc += dt;

      let changed = false;
      while (run.gravityAcc >= interval) {
        run.gravityAcc -= interval;
        const down = tryMove(run.board, run.active, 0, 1);
        if (down) {
          run.active = down;
          if (run.softDrop) run.score += onSoftDrop(1);
          run.grounded = false;
          run.lockAcc = 0;
          changed = true;
        } else {
          run.grounded = true;
          break;
        }
      }

      if (run.grounded) {
        run.lockAcc += dt;
        if (run.lockAcc >= LOCK_DELAY_MS) {
          lockActive(run);
          last = Date.now();
          raf = requestAnimationFrame(loop);
          return;
        }
      }

      if (changed) publish(run);
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [status, lockActive, publish]);

  const level = levelFromScore(score);

  return {
    status,
    board,
    active,
    preview,
    score,
    level,
    gravityMs: gravityMs(level),
    highScore,
    highScoreLoaded,
    startGame,
    move,
    rotate,
    setSoftDrop,
    hardDrop,
    pause,
    resume,
    refreshHighScore,
  };
}
