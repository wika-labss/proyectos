import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { InteractionManager } from 'react-native';
import { AMBIENT_BOOT_DELAY_MS } from '../modules/ambient-audio/playbackPolicy';
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
    let timer: ReturnType<typeof setTimeout> | undefined;
    const task = InteractionManager.runAfterInteractions(() => {
      timer = setTimeout(() => {
        void (async () => {
          try {
            const { audioManager } = await import('../modules/ambient-audio/audioManager');
            if (!alive) return;
            managerRef.current = audioManager;
            await audioManager.start();
            if (!alive) return;
            setAmbient(audioManager.getVolume('ambient'));
          } catch {
            // El menú y Jugar siguen aunque expo-av o el MP3 fallen.
          }
          if (alive) setReady(true);
        })();
      }, AMBIENT_BOOT_DELAY_MS);
    });
    return () => {
      alive = false;
      task.cancel();
      if (timer) clearTimeout(timer);
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
