import { useCallback, useEffect, useRef } from 'react';
import { SOS_PATTERN } from '../engine/sosPattern';
import { useTorchController } from './TorchProvider';

export function useSosPattern() {
  const controller = useTorchController();
  const runningRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    runningRef.current = false;
    clearTimer();
    controller.stopIntensity();
    controller.setTorch(false);
  }, [clearTimer, controller]);

  const runStep = useCallback(
    (stepIndex: number) => {
      if (!runningRef.current) {
        return;
      }

      const step = SOS_PATTERN[stepIndex];
      controller.stopIntensity();
      controller.setTorch(step.action === 'on');

      timeoutRef.current = setTimeout(() => {
        const nextIndex = (stepIndex + 1) % SOS_PATTERN.length;
        runStep(nextIndex);
      }, step.durationMs);
    },
    [controller],
  );

  const start = useCallback(() => {
    stop();
    runningRef.current = true;
    runStep(0);
  }, [runStep, stop]);

  useEffect(() => stop, [stop]);

  return { start, stop };
}
