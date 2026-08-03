import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { IntensityController } from '../engine/intensityController';
import type { TorchController } from '../types';

interface TorchContextValue extends TorchController {
  isTorchMounted: boolean;
}

const TorchContext = createContext<TorchContextValue | null>(null);

interface TorchProviderProps {
  children: React.ReactNode;
  cameraReady: boolean;
}

export function TorchProvider({ children, cameraReady }: TorchProviderProps) {
  const [torchOn, setTorchOn] = useState(false);
  const intensityControllerRef = useRef<IntensityController | null>(null);

  const controller = useMemo<TorchController>(
    () => {
      const base = {
        setTorch: (enabled: boolean) => {
          intensityControllerRef.current?.stop();
          setTorchOn(enabled);
        },
        stopIntensity: () => {
          intensityControllerRef.current?.stop();
        },
      };

      intensityControllerRef.current = new IntensityController({ setTorch: base.setTorch });

      return {
        ...base,
        applyIntensity: (intensity: number) => {
          intensityControllerRef.current?.apply(intensity);
        },
      };
    },
    [],
  );

  const value = useMemo<TorchContextValue>(
    () => ({
      ...controller,
      isTorchMounted: cameraReady,
    }),
    [cameraReady, controller],
  );

  return (
    <TorchContext.Provider value={value}>
      {cameraReady ? (
        <View pointerEvents="none" style={styles.hiddenCamera}>
          <CameraView facing="back" enableTorch={torchOn} style={styles.camera} />
        </View>
      ) : null}
      {children}
    </TorchContext.Provider>
  );
}

export function useTorchController(): TorchContextValue {
  const context = useContext(TorchContext);
  if (!context) {
    throw new Error('useTorchController must be used within TorchProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  hiddenCamera: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
  },
  camera: {
    width: 1,
    height: 1,
  },
});
