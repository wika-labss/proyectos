import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { clampVolume, defaultVolume, type AudioChannel } from '../modules/ambient-audio/volume';

type AmbientAudioApi = {
  ambientVolume: number;
  setAmbientVolume: (value: number) => Promise<void>;
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

  useEffect(() => {
    let alive = true;
    const timer = setTimeout(() => {
      void (async () => {
        try {
          const { audioManager } = await import('../modules/ambient-audio/audioManager');
          if (!alive) return;
          managerRef.current = audioManager;
          await audioManager.start();
          if (!alive) return;
          setAmbient(audioManager.getVolume('ambient'));
        } catch {
          // El menú debe abrir aunque expo-av o el MP3 fallen.
        }
        if (alive) setReady(true);
      })();
    }, 900);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

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
    <AmbientAudioContext.Provider value={{ ambientVolume, setAmbientVolume, ready }}>
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
