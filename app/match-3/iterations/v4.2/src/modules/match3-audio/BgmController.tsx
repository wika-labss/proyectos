import { Audio } from 'expo-av';
import React, { useEffect, useRef } from 'react';
import { useProgress } from '../../hooks/ProgressProvider';

const BGM = require('../../../assets/audio/bgm-america.wav');

export function BgmController() {
  const { progress, ready } = useProgress();
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });
        const { sound } = await Audio.Sound.createAsync(BGM, {
          isLooping: true,
          volume: 0.42,
          isMuted: false,
        });
        if (cancelled) {
          await sound.unloadAsync();
          return;
        }
        soundRef.current = sound;
        await sound.playAsync();
      } catch {
        // web autoplay / missing codec
      }
    })();
    return () => {
      cancelled = true;
      const s = soundRef.current;
      soundRef.current = null;
      if (s) void s.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const s = soundRef.current;
    if (!s) return;
    void s.setIsMutedAsync(progress.bgmMuted);
  }, [progress.bgmMuted, ready]);

  return null;
}
