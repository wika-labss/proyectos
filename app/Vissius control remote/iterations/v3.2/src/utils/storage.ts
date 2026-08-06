import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StoredTvPreferences, TvDevice, TvProtocol } from '../types';
import type { PemCertificate } from '../engine/androidtv/certs';
import { storeAndroidTvCert } from '../engine/drivers/androidTvDriver';
import { logExec, logOk, logWarn } from '../diagnostics/logger';

const STORAGE_KEY = '@vissius-remote/preferences';
const CERT_KEY = '@vissius-remote/androidtv-certs';
const MIGRATION_KEY = '@vissius-remote/migration-version';
const MIGRATION_VERSION = 32; // v3.2

const DEFAULT_PREFERENCES: StoredTvPreferences = {
  pairedDevice: null,
};

function normalizeProtocol(value: unknown): TvProtocol {
  if (value === 'roku' || value === 'androidtv' || value === 'vissius') {
    return value;
  }
  return 'vissius';
}

/** TV mock de v1/dev — no es un dispositivo LAN real. */
export function isLegacyMockDevice(device: TvDevice | null | undefined): boolean {
  if (!device) {
    return false;
  }
  const id = device.id.toLowerCase();
  const name = device.name.toLowerCase();
  return (
    id.startsWith('mock-') ||
    id.includes('mock-tv') ||
    name.includes('mock') ||
    name.includes('bedroom') && id.includes('mock')
  );
}

export async function loadPreferences(): Promise<StoredTvPreferences> {
  try {
    await runStorageMigration();
    await loadAndroidTvCerts();
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      logExec('storage.load', 'no_paired_device');
      return DEFAULT_PREFERENCES;
    }

    const parsed = JSON.parse(raw) as Partial<StoredTvPreferences>;
    if (!parsed.pairedDevice) {
      logExec('storage.load', 'no_paired_device');
      return DEFAULT_PREFERENCES;
    }

    const device = parsed.pairedDevice;
    if (
      typeof device.id === 'string' &&
      typeof device.name === 'string' &&
      typeof device.ip === 'string' &&
      typeof device.port === 'number'
    ) {
      const normalized: TvDevice = {
        ...device,
        protocol: normalizeProtocol(device.protocol),
      };

      if (isLegacyMockDevice(normalized)) {
        logWarn(
          'storage.cleanMock',
          `removed id=${normalized.id} ip=${normalized.ip} (legacy mock v1)`,
        );
        await clearPairedDevice();
        return DEFAULT_PREFERENCES;
      }

      logOk(
        'storage.load',
        `paired id=${normalized.id} protocol=${normalized.protocol} ip=${normalized.ip}`,
      );
      return { pairedDevice: normalized };
    }

    logWarn('storage.load', 'invalid_paired_shape — cleared');
    await clearPairedDevice();
    return DEFAULT_PREFERENCES;
  } catch (error) {
    logWarn('storage.load', error instanceof Error ? error.message : String(error));
    return DEFAULT_PREFERENCES;
  }
}

async function runStorageMigration(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(MIGRATION_KEY);
    const current = raw ? Number(raw) : 0;
    if (current >= MIGRATION_VERSION) {
      return;
    }

    logExec('storage.migration', `from=${current || 0} to=${MIGRATION_VERSION}`);

    // v3.2: purgar mocks guardados de iteraciones anteriores
    const prefRaw = await AsyncStorage.getItem(STORAGE_KEY);
    if (prefRaw) {
      try {
        const parsed = JSON.parse(prefRaw) as Partial<StoredTvPreferences>;
        if (parsed.pairedDevice && isLegacyMockDevice(parsed.pairedDevice as TvDevice)) {
          await AsyncStorage.removeItem(STORAGE_KEY);
          logOk('storage.migration', 'purged_legacy_mock');
        }
      } catch {
        await AsyncStorage.removeItem(STORAGE_KEY);
        logWarn('storage.migration', 'corrupt_preferences_cleared');
      }
    }

    await AsyncStorage.setItem(MIGRATION_KEY, String(MIGRATION_VERSION));
    logOk('storage.migration', `done version=${MIGRATION_VERSION}`);
  } catch (error) {
    logWarn('storage.migration', error instanceof Error ? error.message : String(error));
  }
}

export async function savePairedDevice(device: TvDevice | null): Promise<void> {
  if (device && isLegacyMockDevice(device)) {
    logWarn('storage.save', `blocked_mock id=${device.id}`);
    await clearPairedDevice();
    return;
  }
  const preferences: StoredTvPreferences = { pairedDevice: device };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  logOk(
    'storage.save',
    device ? `paired id=${device.id} protocol=${device.protocol} ip=${device.ip}` : 'cleared',
  );
}

export async function clearPairedDevice(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
  logExec('storage.clear', 'paired_device_removed');
}

export async function loadAndroidTvCerts(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(CERT_KEY);
    if (!raw) {
      return;
    }
    const map = JSON.parse(raw) as Record<string, PemCertificate>;
    let count = 0;
    for (const [id, cert] of Object.entries(map)) {
      if (cert?.key && cert?.cert) {
        storeAndroidTvCert(id, cert);
        count += 1;
      }
    }
    if (count > 0) {
      logExec('storage.certs', `loaded=${count}`);
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
    logOk('storage.certs', `saved deviceId=${deviceId}`);
  } catch {
    // ignore
  }
}
