import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StoredTvPreferences, TvDevice, TvProtocol } from '../types';
import type { PemCertificate } from '../engine/androidtv/certs';
import { storeAndroidTvCert } from '../engine/drivers/androidTvDriver';

const STORAGE_KEY = '@vissius-remote/preferences';
const CERT_KEY = '@vissius-remote/androidtv-certs';

const DEFAULT_PREFERENCES: StoredTvPreferences = {
  pairedDevice: null,
};

function normalizeProtocol(value: unknown): TvProtocol {
  if (value === 'roku' || value === 'androidtv' || value === 'vissius') {
    return value;
  }
  return 'vissius';
}

export async function loadPreferences(): Promise<StoredTvPreferences> {
  try {
    await loadAndroidTvCerts();
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_PREFERENCES;
    }

    const parsed = JSON.parse(raw) as Partial<StoredTvPreferences>;
    if (!parsed.pairedDevice) {
      return DEFAULT_PREFERENCES;
    }

    const device = parsed.pairedDevice;
    if (
      typeof device.id === 'string' &&
      typeof device.name === 'string' &&
      typeof device.ip === 'string' &&
      typeof device.port === 'number'
    ) {
      return {
        pairedDevice: {
          ...device,
          protocol: normalizeProtocol(device.protocol),
        },
      };
    }

    return DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function savePairedDevice(device: TvDevice | null): Promise<void> {
  const preferences: StoredTvPreferences = { pairedDevice: device };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

export async function clearPairedDevice(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function loadAndroidTvCerts(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(CERT_KEY);
    if (!raw) {
      return;
    }
    const map = JSON.parse(raw) as Record<string, PemCertificate>;
    for (const [id, cert] of Object.entries(map)) {
      if (cert?.key && cert?.cert) {
        storeAndroidTvCert(id, cert);
      }
    }
  } catch {
    // ignore
  }
}

export async function saveAndroidTvCert(deviceId: string, cert: PemCertificate): Promise<void> {
  storeAndroidTvCert(deviceId, cert);
  try {
    const raw = await AsyncStorage.getItem(CERT_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, PemCertificate>) : {};
    map[deviceId] = cert;
    await AsyncStorage.setItem(CERT_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}
