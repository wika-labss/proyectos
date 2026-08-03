import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTorchStore } from '../stores/torchStore';
import { loadPreferences } from '../utils/storage';

export function useFlashAvailability() {
  const [permission, requestPermission] = useCameraPermissions();
  const [checking, setChecking] = useState(true);
  const setFlashAvailable = useTorchStore((state) => state.setFlashAvailable);
  const setIntensity = useTorchStore((state) => state.setIntensity);
  const setLoaded = useTorchStore((state) => state.setLoaded);

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

  const markCameraUnavailable = () => {
    setFlashAvailable(false);
  };

  const cameraReady = Platform.OS === 'android' && Boolean(permission?.granted);

  return {
    checking,
    cameraReady,
    permissionGranted: Boolean(permission?.granted),
    markCameraUnavailable,
  };
}
