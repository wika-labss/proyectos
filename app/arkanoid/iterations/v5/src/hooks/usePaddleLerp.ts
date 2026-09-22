import { useCallback, useEffect, useRef } from 'react';
import { motion } from '../design-system/tokens';

type GetCenter = () => number | null;

/** Lerp UI hacia el thumb. No toca setPaddleX del engine; llama movePaddle con X interpolada. */
export function usePaddleLerp(
  movePaddle: (worldCenterX: number) => void,
  getCenter: GetCenter,
  enabled: boolean,
) {
  const targetRef = useRef<number | null>(null);
  const moveRef = useRef(movePaddle);
  const getRef = useRef(getCenter);
  moveRef.current = movePaddle;
  getRef.current = getCenter;

  const setTarget = useCallback((worldCenterX: number) => {
    targetRef.current = worldCenterX;
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let last = Date.now();
    let alive = true;

    const tick = () => {
      if (!alive) return;
      const now = Date.now();
      const dt = Math.min(32, now - last);
      last = now;
      const target = targetRef.current;
      const current = getRef.current();
      if (target != null && current != null) {
        const k = 1 - Math.exp(-dt / motion.paddleLerpMs);
        const next = current + (target - current) * k;
        if (Math.abs(next - target) < 0.6) {
          moveRef.current(target);
        } else {
          moveRef.current(next);
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  return setTarget;
}
