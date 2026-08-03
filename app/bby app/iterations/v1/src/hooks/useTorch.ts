import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useTorchStore } from '../stores/torchStore';
import { saveIntensity } from '../utils/storage';
import { useSosPattern } from './useSosPattern';
import { useTorchController } from './TorchProvider';

const KEEP_AWAKE_TAG = 'bby-light-torch';

export function useTorch() {
  const controller = useTorchController();
  const { start: startSosPattern, stop: stopSosPattern } = useSosPattern();
  const mode = useTorchStore((state) => state.mode);
  const intensity = useTorchStore((state) => state.intensity);
  const setMode = useTorchStore((state) => state.setMode);
  const setIntensity = useTorchStore((state) => state.setIntensity);

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
    if (intensity <= 0) {
      return;
    }

    stopSosPattern();
    setMode('on');
    controller.applyIntensity(intensity);
    await syncKeepAwake(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [controller, intensity, setMode, stopSosPattern, syncKeepAwake]);

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
      stopSosPattern();
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
  }, [mode, stopSosPattern, turnOff, turnOn]);

  const updateIntensity = useCallback(
    async (value: number) => {
      setIntensity(value);
      await saveIntensity(value);

      if (mode === 'on' && value > 0) {
        controller.applyIntensity(value);
      }

      if (mode === 'on' && value <= 0) {
        await turnOff();
      }
    },
    [controller, mode, setIntensity, turnOff],
  );

  const shutdown = useCallback(async () => {
    await turnOff();
  }, [turnOff]);

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
