import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'geo-empresa.registration.v1';

export type RegistrationRecord = {
  fingerprint: string;
  dispositivoId?: string;
  nombreRegistrado: string;
  estadoEnrollment: string;
};

export async function loadRegistration(): Promise<RegistrationRecord | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RegistrationRecord;
  } catch {
    return null;
  }
}

export async function saveRegistration(record: RegistrationRecord): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(record));
}

export async function getOrCreateFingerprint(): Promise<string> {
  const existing = await loadRegistration();
  if (existing?.fingerprint) return existing.fingerprint;
  const fingerprint = `geo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return fingerprint;
}
