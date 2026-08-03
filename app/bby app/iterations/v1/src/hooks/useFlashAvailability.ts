import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTorchStore } from '../stores/torchStore';
import { loadPreferences } from '../utils/storage';

export function useFlashAvailability() {
  const [permission, requestPermission] = useCameraPermissions();
  const [checking, setChecking] = useState(true);
  const isFlashAvailable = useTorchStore((state) => state.isFlashAvailable);
  const setFlashAvailable = useTorchStore((state) => state.setFlashAvailable);
  const setIntensity = useTorchStore((state) => state.setIntensity);
  const setLoaded = useTorchStore((state) => state.setLoaded);
  const setMode = useTorchStore((state) => state.setMode);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      if (Platform.OS !== 'android') {
        if (mounted) {
          setFlashAvailable(false);
          setLoaded(true);
          setChecking(false);
        }
        return;
      }

      if (!permission?.granted) {
        const result = await requestPermission();
        if (!mounted) {
          return;
        }

        if (!result.granted) {
          setFlashAvailable(false);
          setLoaded(true);
          setChecking(false);
          return;
        }
      }

      const cameraAvailable = await CameraView.isAvailableAsync();
      if (!mounted) {
        return;
      }

      if (!cameraAvailable) {
        setFlashAvailable(false);
        setLoaded(true);
        setChecking(false);
        return;
      }

      const preferences = await loadPreferences();
      if (!mounted) {
        return;
      }

      setIntensity(preferences.intensity);
      setFlashAvailable(true);
      setLoaded(true);
      setChecking(false);
    }

    void initialize();

    return () => {
      mounted = false;
    };
  }, [permission?.granted, requestPermission, setFlashAvailable, setIntensity, setLoaded]);

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
