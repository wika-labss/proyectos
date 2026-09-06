import { Audio, type AVPlaybackStatusSuccess } from 'expo-av';
import { loadChannelVolume, saveChannelVolume } from './storage';
import {
  type AudioChannel,
  clampVolume,
  defaultVolume,
} from './volume';

const AMBIENT_LOOP = require('../../../assets/recursos/audio/ambient-loop.mp3') as number;

/**
 * Gestor de audio por canales.
 * El volumen ambiente no comparte valor con el canal SFX (reservado).
 */
export class AudioManager {
  private sound: Audio.Sound | null = null;
  private volumes: Record<AudioChannel, number> = {
    ambient: defaultVolume('ambient'),
    sfx: defaultVolume('sfx'),
  };
  private started = false;
  private starting: Promise<void> | null = null;

  getVolume(channel: AudioChannel): number {
    return this.volumes[channel];
  }

  async setVolume(channel: AudioChannel, value: number): Promise<number> {
    const next = clampVolume(value, defaultVolume(channel));
    this.volumes[channel] = next;
    await saveChannelVolume(channel, next);
    if (channel === 'ambient' && this.sound) {
      await this.sound.setVolumeAsync(next);
    }
    return next;
  }

  async start(): Promise<void> {
    if (this.started) return;
    if (this.starting) return this.starting;
    this.starting = this.boot();
    try {
      await this.starting;
    } finally {
      this.starting = null;
    }
  }

  async stop(): Promise<void> {
    const current = this.sound;
    this.sound = null;
    this.started = false;
    if (!current) return;
    try {
      await current.stopAsync();
      await current.unloadAsync();
    } catch {
      // ignore teardown errors
    }
  }

  private async boot(): Promise<void> {
    this.volumes.ambient = await loadChannelVolume('ambient');
    this.volumes.sfx = await loadChannelVolume('sfx');
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      const { sound } = await Audio.Sound.createAsync(
        AMBIENT_LOOP,
        {
          isLooping: true,
          volume: this.volumes.ambient,
          shouldPlay: true,
        },
      );
      this.sound = sound;
      this.started = true;
      const status = (await sound.getStatusAsync()) as AVPlaybackStatusSuccess;
      if (status.isLoaded && !status.isPlaying) {
        await sound.playAsync();
      }
    } catch {
      this.started = true;
    }
  }
}

export const audioManager = new AudioManager();
