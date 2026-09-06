import { Audio, type AVPlaybackStatusSuccess } from 'expo-av';
import { loadAmbientTheme, loadChannelVolume, saveAmbientTheme, saveChannelVolume } from './storage';
import { resolveAmbientAsset } from './themeAssets';
import {
  DEFAULT_AMBIENT_THEME,
  resolveAmbientTheme,
  type AmbientThemeId,
} from './themes';
import {
  type AudioChannel,
  clampVolume,
  defaultVolume,
} from './volume';

/**
 * Gestor de audio por canales + cambio de tema ambiente.
 * setTheme busca el archivo, detiene la pista actual y reproduce la nueva en loop.
 */
export class AudioManager {
  private sound: Audio.Sound | null = null;
  private theme: AmbientThemeId = DEFAULT_AMBIENT_THEME;
  private volumes: Record<AudioChannel, number> = {
    ambient: defaultVolume('ambient'),
    sfx: defaultVolume('sfx'),
  };
  private started = false;
  private starting: Promise<void> | null = null;
  private switching: Promise<AmbientThemeId> | null = null;

  getVolume(channel: AudioChannel): number {
    return this.volumes[channel];
  }

  getTheme(): AmbientThemeId {
    return this.theme;
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

  /**
   * Cambia el tema ambiente: resuelve el archivo, para lo que suena y lanza el loop nuevo.
   */
  async setTheme(id: string): Promise<AmbientThemeId> {
    await this.start();
    if (this.switching) await this.switching;
    const work = this.switchTheme(id);
    this.switching = work;
    try {
      return await work;
    } finally {
      if (this.switching === work) this.switching = null;
    }
  }

  async stop(): Promise<void> {
    await this.stopCurrent();
    this.started = false;
  }

  private async boot(): Promise<void> {
    this.volumes.ambient = await loadChannelVolume('ambient');
    this.volumes.sfx = await loadChannelVolume('sfx');
    this.theme = await loadAmbientTheme();
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      await this.playResolved(this.theme);
      this.started = true;
    } catch {
      this.started = true;
    }
  }

  private async switchTheme(id: string): Promise<AmbientThemeId> {
    const theme = resolveAmbientTheme(id);
    if (theme.id === this.theme && this.sound) {
      return theme.id;
    }
    await this.stopCurrent();
    this.theme = theme.id;
    await saveAmbientTheme(theme.id);
    await this.playResolved(theme.id);
    return theme.id;
  }

  private async stopCurrent(): Promise<void> {
    const current = this.sound;
    this.sound = null;
    if (!current) return;
    try {
      await current.stopAsync();
    } catch {
      // already stopped
    }
    try {
      await current.unloadAsync();
    } catch {
      // ignore teardown errors
    }
  }

  private async playResolved(id: AmbientThemeId): Promise<void> {
    const asset = resolveAmbientAsset(id);
    const { sound } = await Audio.Sound.createAsync(asset, {
      isLooping: true,
      volume: this.volumes.ambient,
      shouldPlay: true,
    });
    this.sound = sound;
    const status = (await sound.getStatusAsync()) as AVPlaybackStatusSuccess;
    if (status.isLoaded && !status.isPlaying) {
      await sound.playAsync();
    }
  }
}

export const audioManager = new AudioManager();
