import { resolveAmbientAsset } from './themeAssets';
import { ambientInitialStatus } from './playbackPolicy';
import { loadChannelVolume, saveAmbientTheme, saveChannelVolume } from './storage';
import { DEFAULT_AMBIENT_THEME, resolveAmbientTheme, type AmbientThemeId } from './themes';
import { type AudioChannel, clampVolume, defaultVolume } from './volume';

type SoundHandle = {
  setVolumeAsync: (value: number) => Promise<unknown>;
  stopAsync: () => Promise<unknown>;
  unloadAsync: () => Promise<unknown>;
  playAsync: () => Promise<unknown>;
  getStatusAsync: () => Promise<{ isLoaded?: boolean; isPlaying?: boolean }>;
};

/**
 * Gestor de audio por canales.
 * expo-av se importa solo en playResolved (después del primer frame).
 */
export class AudioManager {
  private sound: SoundHandle | null = null;
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
      try {
        await this.sound.setVolumeAsync(next);
      } catch {
        // el slider no puede tumbar la partida
      }
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
    this.theme = DEFAULT_AMBIENT_THEME;
    await saveAmbientTheme(this.theme);
    try {
      await this.stopCurrent();
      await this.playResolved(this.theme);
      this.started = true;
    } catch {
      this.started = true;
    }
  }

  private async switchTheme(id: string): Promise<AmbientThemeId> {
    const theme = resolveAmbientTheme(id);
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

  private async playResolved(_id: AmbientThemeId): Promise<void> {
    const [{ Audio }, { Asset }] = await Promise.all([import('expo-av'), import('expo-asset')]);
    const asset = Asset.fromModule(resolveAmbientAsset());
    await asset.downloadAsync();
    const uri = asset.localUri ?? asset.uri;
    if (!uri) {
      throw new Error('ambient-castle uri missing');
    }

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch {
      // el modo es opcional; el loop igual se intenta
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri },
      ambientInitialStatus(this.volumes.ambient),
      null,
      false,
    );
    this.sound = sound;
    const status = await sound.getStatusAsync();
    if (status.isLoaded && !status.isPlaying) {
      await sound.playAsync();
    }
  }
}

export const audioManager = new AudioManager();
