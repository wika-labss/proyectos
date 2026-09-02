import { useCallback, useEffect, useRef, useState } from 'react';
import { IDLE_HINT_MS } from '../../constants/game';
import {
  findHintMove,
  type Board,
  type HintMove,
} from '../../engine/match3Engine';

export function useIdleHint(
  board: Board,
  enabled: boolean,
  idleMs: number = IDLE_HINT_MS,
): {
  hint: HintMove | null;
  bumpActivity: () => void;
  clearHint: () => void;
} {
  const [hint, setHint] = useState<HintMove | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHint = useCallback(() => setHint(null), []);

  const bumpActivity = useCallback(() => {
    setHint(null);
    if (timer.current) clearTimeout(timer.current);
    if (!enabled) return;
    timer.current = setTimeout(() => {
      setHint(findHintMove(board));
    }, idleMs);
  }, [board, enabled, idleMs]);

  useEffect(() => {
    bumpActivity();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [bumpActivity]);

  return { hint, bumpActivity, clearHint };
}
