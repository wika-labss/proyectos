import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTorchStore } from '../stores/torchStore';
import { loadPreferences } from '../utils/storage';

export function useFlashAvailability() {
  const [permission, requestPermission] = useCameraPermissions();
  const [checking, setChecking] = useState(true);
  const isFlashAvailable = useTorchStore((state) => state.isFlashAvailable);
  const recheckToken = useTorchStore((state) => state.recheckToken);
  const setFlashAvailable = useTorchStore((state) => state.setFlashAvailable);
  const setIntensity = useTorchStore((state) => state.setIntensity);
  const setLoaded = useTorchStore((state) => state.setLoaded);
  const setMode = useTorchStore((state) => state.setMode);

  useEffect(() => {
    let active = true;

    const finish = (available: boolean) => {
      if (!active) {
        return;
      }
      setFlashAvailable(available);
      setLoaded(true);
      setChecking(false);
    };

    async function initialize() {
      setChecking(true);

      if (Platform.OS !== 'android') {
        finish(false);
        return;
      }

      if (!permission?.granted) {
        const result = await requestPermission();
        if (!active) {
          return;
        }

        if (!result.granted) {
          finish(false);
          return;
        }
      }

      const cameraAvailable = await CameraView.isAvailableAsync();
      if (!active) {
        return;
      }

      if (!cameraAvailable) {
        finish(false);
        return;
      }

      const preferences = await loadPreferences();
      if (!active) {
        return;
      }

      setIntensity(preferences.intensity);
      finish(true);
    }

    void initialize();

    return () => {
      active = false;
    };
  }, [
    permission?.granted,
    recheckToken,
    requestPermission,
    setFlashAvailable,
    setIntensity,
    setLoaded,
  ]);

  const markCameraUnavailable = useCallback(() => {
    setFlashAvailable(false);
    setMode('off');
  }, [setFlashAvailable, setMode]);

  const permissionGranted = Platform.OS === 'android' && Boolean(permission?.granted);
  const cameraReady = permissionGranted && isFlashAvailable;

  return {
    checking,
    cameraReady,
    permissionGranted,
    markCameraUnavailable,
  };
}
