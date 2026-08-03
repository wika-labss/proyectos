import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { IntensityController } from '../engine/intensityController';
import type { TorchController } from '../types';

const TorchContext = createContext<TorchController | null>(null);

interface TorchProviderProps {
  children: React.ReactNode;
  cameraReady: boolean;
  onCameraUnavailable?: () => void;
}

const CAMERA_PREVIEW_SIZE = 100;

export function TorchProvider({ children, cameraReady, onCameraUnavailable }: TorchProviderProps) {
  const [torchOn, setTorchOn] = useState(false);
  const intensityControllerRef = useRef<IntensityController | null>(null);

  const setTorchState = useCallback((enabled: boolean) => {
    setTorchOn(enabled);
  }, []);

  useEffect(() => {
    const instance = new IntensityController({ setTorchState });
    intensityControllerRef.current = instance;

    return () => {
      instance.stop();
      intensityControllerRef.current = null;
    };
  }, [setTorchState]);

  const controller = useMemo<TorchController>(
    () => ({
      setTorch: (enabled: boolean) => {
        intensityControllerRef.current?.stop();
        setTorchState(enabled);
      },
      applyIntensity: (intensity: number) => {
        intensityControllerRef.current?.apply(intensity);
      },
      stopIntensity: () => {
        intensityControllerRef.current?.stop();
      },
    }),
    [setTorchState],
  );

  const handleMountError = useCallback(() => {
    intensityControllerRef.current?.stop();
    setTorchState(false);
    onCameraUnavailable?.();
  }, [onCameraUnavailable, setTorchState]);

  return (
    <TorchContext.Provider value={controller}>
      {cameraReady ? (
        <View pointerEvents="none" style={styles.hiddenCamera}>
          <CameraView
            facing="back"
            enableTorch={torchOn}
            style={styles.camera}
            onMountError={handleMountError}
          />
        </View>
      ) : null}
      {children}
    </TorchContext.Provider>
  );
}

export function useTorchController(): TorchController {
  const context = useContext(TorchContext);
  if (!context) {
    throw new Error('useTorchController must be used within TorchProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  hiddenCamera: {
    position: 'absolute',
    left: -CAMERA_PREVIEW_SIZE,
    top: -CAMERA_PREVIEW_SIZE,
    width: CAMERA_PREVIEW_SIZE,
    height: CAMERA_PREVIEW_SIZE,
    opacity: 0.01,
    overflow: 'hidden',
  },
  camera: {
    width: CAMERA_PREVIEW_SIZE,
    height: CAMERA_PREVIEW_SIZE,
  },
});
