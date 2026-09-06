import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { audioManager, clampVolume, defaultVolume } from '../modules/ambient-audio';

type AmbientAudioApi = {
  ambientVolume: number;
  setAmbientVolume: (value: number) => Promise<void>;
  ready: boolean;
};

const AmbientAudioContext = createContext<AmbientAudioApi | null>(null);

export function AmbientAudioProvider({ children }: { children: React.ReactNode }) {
  const [ambientVolume, setAmbient] = useState(defaultVolume('ambient'));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    const timer = setTimeout(() => {
      void (async () => {
        try {
          await audioManager.start();
        } catch {
          // El menú debe abrir aunque el MP3 falle en un dispositivo.
        }
        if (!alive) return;
        setAmbient(audioManager.getVolume('ambient'));
        setReady(true);
      })();
    }, 700);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  const setAmbientVolume = useCallback(async (value: number) => {
    const next = await audioManager.setVolume('ambient', clampVolume(value));
    setAmbient(next);
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
