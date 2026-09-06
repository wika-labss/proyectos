import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  audioManager,
  clampVolume,
  DEFAULT_AMBIENT_THEME,
  defaultVolume,
  nextAmbientTheme,
  resolveAmbientTheme,
  type AmbientThemeId,
} from '../modules/ambient-audio';

type AmbientAudioApi = {
  ambientVolume: number;
  sfxVolume: number;
  theme: AmbientThemeId;
  themeLabel: string;
  setAmbientVolume: (value: number) => Promise<void>;
  setAmbientTheme: (id: string) => Promise<void>;
  cycleAmbientTheme: () => Promise<void>;
  ready: boolean;
};

const AmbientAudioContext = createContext<AmbientAudioApi | null>(null);

export function AmbientAudioProvider({ children }: { children: React.ReactNode }) {
  const [ambientVolume, setAmbient] = useState(defaultVolume('ambient'));
  const [sfxVolume, setSfx] = useState(defaultVolume('sfx'));
  const [theme, setTheme] = useState<AmbientThemeId>(DEFAULT_AMBIENT_THEME);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      await audioManager.start();
      if (!alive) return;
      setAmbient(audioManager.getVolume('ambient'));
      setSfx(audioManager.getVolume('sfx'));
      setTheme(audioManager.getTheme());
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

  const setAmbientTheme = useCallback(async (id: string) => {
    const next = await audioManager.setTheme(id);
    setTheme(next);
  }, []);

  const cycleAmbientTheme = useCallback(async () => {
    const next = await audioManager.setTheme(nextAmbientTheme(audioManager.getTheme()));
    setTheme(next);
  }, []);

  return (
    <AmbientAudioContext.Provider
      value={{
        ambientVolume,
        sfxVolume,
        theme,
        themeLabel: resolveAmbientTheme(theme).label,
        setAmbientVolume,
        setAmbientTheme,
        cycleAmbientTheme,
        ready,
      }}
    >
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

export function useOptionalAmbientAudio(): AmbientAudioApi | null {
  return useContext(AmbientAudioContext);
}
