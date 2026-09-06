import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AMBIENT_VOLUME_KEY,
  SFX_VOLUME_KEY,
  type AudioChannel,
  parseStoredVolume,
} from './volume';

function keyFor(channel: AudioChannel): string {
  return channel === 'ambient' ? AMBIENT_VOLUME_KEY : SFX_VOLUME_KEY;
}

export async function loadChannelVolume(channel: AudioChannel): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(keyFor(channel));
    return parseStoredVolume(raw, channel);
  } catch {
    return parseStoredVolume(null, channel);
  }
}

export async function saveChannelVolume(channel: AudioChannel, value: number): Promise<void> {
  try {
    await AsyncStorage.setItem(keyFor(channel), String(value));
  } catch {
    // offline-first: ignore persistence failures
  }
}
