import { useCallback, useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useTorchStore } from '../stores/torchStore';
import { saveIntensity } from '../utils/storage';
import { useSosPattern } from './useSosPattern';
import { useTorchController } from './TorchProvider';

const KEEP_AWAKE_TAG = 'bby-light-torch';
// Lowest level that still produces visible light through the PWM controller.
const MIN_ON_INTENSITY = 25;
const INTENSITY_SAVE_DEBOUNCE_MS = 400;

export function useTorch() {
  const controller = useTorchController();
  const { start: startSosPattern, stop: stopSosPattern } = useSosPattern();
  const mode = useTorchStore((state) => state.mode);
  const intensity = useTorchStore((state) => state.intensity);
  const setMode = useTorchStore((state) => state.setMode);
  const setIntensity = useTorchStore((state) => state.setIntensity);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingIntensityRef = useRef<number | null>(null);

  const flushIntensity = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    const pending = pendingIntensityRef.current;
    if (pending !== null) {
      pendingIntensityRef.current = null;
      void saveIntensity(pending);
    }
  }, []);

  const persistIntensity = useCallback(
    (value: number) => {
      pendingIntensityRef.current = value;

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = setTimeout(flushIntensity, INTENSITY_SAVE_DEBOUNCE_MS);
    },
    [flushIntensity],
  );

  useEffect(() => flushIntensity, [flushIntensity]);

  const syncKeepAwake = useCallback(async (active: boolean) => {
    if (active) {
      await activateKeepAwakeAsync(KEEP_AWAKE_TAG);
      return;
    }
    deactivateKeepAwake(KEEP_AWAKE_TAG);
  }, []);

  const turnOff = useCallback(async () => {
    stopSosPattern();
    controller.stopIntensity();
    controller.setTorch(false);
    setMode('off');
    await syncKeepAwake(false);
  }, [controller, setMode, stopSosPattern, syncKeepAwake]);

  const turnOn = useCallback(async () => {
    // Pressing the torch button with the slider at zero raises it to the lowest
    // visible level instead of silently doing nothing.
    const target = intensity > 0 ? intensity : MIN_ON_INTENSITY;

    if (target !== intensity) {
      setIntensity(target);
      persistIntensity(target);
    }

    stopSosPattern();
    setMode('on');
    controller.applyIntensity(target);
    await syncKeepAwake(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [controller, intensity, persistIntensity, setIntensity, setMode, stopSosPattern, syncKeepAwake]);

  const enterSos = useCallback(async () => {
    stopSosPattern();
    controller.stopIntensity();
    setMode('sos');
    startSosPattern();
    await syncKeepAwake(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, [controller, setMode, startSosPattern, stopSosPattern, syncKeepAwake]);

  const exitSos = useCallback(async () => {
    await turnOff();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [turnOff]);

  const toggle = useCallback(async () => {
    if (mode === 'sos') {
      await turnOff();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }

    if (mode === 'on') {
      await turnOff();
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }

    await turnOn();
  }, [mode, turnOff, turnOn]);

  const updateIntensity = useCallback(
    async (value: number) => {
      setIntensity(value);
      persistIntensity(value);

      if (mode !== 'on') {
        return;
      }

      if (value > 0) {
        controller.applyIntensity(value);
        return;
      }

      await turnOff();
    },
    [controller, mode, persistIntensity, setIntensity, turnOff],
  );

  const shutdown = useCallback(async () => {
    flushIntensity();
    await turnOff();
  }, [flushIntensity, turnOff]);

  return {
    mode,
    intensity,
    turnOn,
    turnOff,
    toggle,
    enterSos,
    exitSos,
    updateIntensity,
    shutdown,
  };
}
