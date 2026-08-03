import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useTorchStore } from '../stores/torchStore';
import { saveIntensity } from '../utils/storage';
import { useTorchController } from './TorchProvider';

const KEEP_AWAKE_TAG = 'bby-light-torch';

export function useTorch() {
  const controller = useTorchController();
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
    controller.stopIntensity();
    controller.setTorch(false);
    setMode('off');
    await syncKeepAwake(false);
  }, [controller, setMode, syncKeepAwake]);

  const turnOn = useCallback(async () => {
    setMode('on');
    controller.applyIntensity(intensity);
    await syncKeepAwake(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [controller, intensity, setMode, syncKeepAwake]);

  const toggle = useCallback(async () => {
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
      await saveIntensity(value);

      if (mode === 'on') {
        controller.applyIntensity(value);
      }
    },
    [controller, mode, setIntensity],
  );

  return {
    mode,
    intensity,
    turnOn,
    turnOff,
    toggle,
    updateIntensity,
    syncKeepAwake,
  };
}
