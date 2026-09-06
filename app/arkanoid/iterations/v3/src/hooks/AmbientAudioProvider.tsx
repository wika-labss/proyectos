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
    void (async () => {
      await audioManager.start();
      if (!alive) return;
      setAmbient(audioManager.getVolume('ambient'));
      setReady(true);
    })();
    return () => {
      alive = false;
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
