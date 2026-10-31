import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { clampVolume, defaultVolume, type AudioChannel } from '../modules/ambient-audio/volume';

type AmbientAudioApi = {
  ambientVolume: number;
  setAmbientVolume: (value: number) => Promise<void>;
  ensureStarted: () => Promise<void>;
  ready: boolean;
};

type DelayedAudioManager = {
  start: () => Promise<void>;
  getVolume: (channel: AudioChannel) => number;
  setVolume: (channel: AudioChannel, value: number) => Promise<number>;
};

const AmbientAudioContext = createContext<AmbientAudioApi | null>(null);

export function AmbientAudioProvider({ children }: { children: React.ReactNode }) {
  const [ambientVolume, setAmbient] = useState(defaultVolume('ambient'));
  const [ready, setReady] = useState(false);
  const managerRef = useRef<DelayedAudioManager | null>(null);
  const startingRef = useRef<Promise<void> | null>(null);

  const ensureStarted = useCallback(async () => {
    if (ready && managerRef.current) return;
    if (startingRef.current) return startingRef.current;
    startingRef.current = (async () => {
      try {
        const { audioManager } = await import('../modules/ambient-audio/audioManager');
        managerRef.current = audioManager;
        await audioManager.start();
        setAmbient(audioManager.getVolume('ambient'));
      } catch {
        // Jugar y el menú no dependen de expo-av.
      }
      setReady(true);
    })();
    try {
      await startingRef.current;
    } finally {
      startingRef.current = null;
    }
  }, [ready]);

  const setAmbientVolume = useCallback(async (value: number) => {
    const next = clampVolume(value);
    setAmbient(next);
    try {
      await managerRef.current?.setVolume('ambient', next);
    } catch {
      // ignore
    }
  }, []);

  return (
    <AmbientAudioContext.Provider value={{ ambientVolume, setAmbientVolume, ensureStarted, ready }}>
      {children}
    </AmbientAudioContext.Provider>
  );
}

export function useAmbientAudio(): AmbientAudioApi {
  const ctx = useContext(AmbientAudioContext);
  if (!ctx) {
    throw new Error('useAmbientAudio must be used within AmbientAudioProvider');
  }
  return ctx;
}
