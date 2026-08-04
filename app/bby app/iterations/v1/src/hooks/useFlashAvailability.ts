import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
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

    // Android has no JS-level API to query for a flash LED: expo-camera's
    // isAvailableAsync is web-only and throws here. Availability is assumed once
    // the permission is granted, and CameraView.onMountError demotes it later.
    async function initialize() {
      setChecking(true);
      let available = false;

      try {
        if (Platform.OS === 'android') {
          const granted = permission?.granted || (await requestPermission()).granted;

          if (active && granted) {
            const preferences = await loadPreferences();

            if (active) {
              setIntensity(preferences.intensity);
              available = true;
            }
          }
        }
      } catch {
        available = false;
      } finally {
        // Always resolves the loading gate, otherwise the app hangs on the spinner.
        if (active) {
          setFlashAvailable(available);
          setLoaded(true);
          setChecking(false);
        }
      }
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
