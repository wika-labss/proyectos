import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import { appConfig, type LockState, type RegistrationRecord } from '../../constants/config';

export async function buildDeviceFingerprint(): Promise<string> {
  const androidId = Application.getAndroidId?.();
  if (!androidId) {
    throw new Error('No se pudo obtener ANDROID_ID. Registro no disponible en este dispositivo.');
  }
  return `android-${androidId}`;
}

export async function loadRegistration(): Promise<RegistrationRecord | null> {
  const raw = await AsyncStorage.getItem(appConfig.storageKeys.registration);
  if (!raw) {
    return null;
  }
  return JSON.parse(raw) as RegistrationRecord;
}

export async function saveRegistration(record: RegistrationRecord): Promise<void> {
  await AsyncStorage.setItem(appConfig.storageKeys.registration, JSON.stringify(record));
}

export async function clearRegistration(): Promise<void> {
  await AsyncStorage.removeItem(appConfig.storageKeys.registration);
}

export type LastLocation = {
  lat: number;
  lng: number;
  accuracyM?: number;
};

export async function saveLastLocation(location: LastLocation): Promise<void> {
  await AsyncStorage.setItem(appConfig.storageKeys.lastLocation, JSON.stringify(location));
}

export async function loadLastLocation(): Promise<LastLocation | null> {
  const raw = await AsyncStorage.getItem(appConfig.storageKeys.lastLocation);
  if (!raw) {
    return null;
  }
  return JSON.parse(raw) as LastLocation;
}

export async function savePhoneOn(value: boolean): Promise<void> {
  await AsyncStorage.setItem(appConfig.storageKeys.phoneOn, value ? '1' : '0');
}

export async function loadPhoneOn(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(appConfig.storageKeys.phoneOn);
  if (raw === '0') {
    return false;
  }
  return true;
}

export async function saveLockState(state: LockState): Promise<void> {
  await AsyncStorage.setItem(appConfig.storageKeys.lockState, JSON.stringify(state));
}

export async function loadLockState(): Promise<LockState | null> {
  const raw = await AsyncStorage.getItem(appConfig.storageKeys.lockState);
  if (!raw) {
    return null;
  }
  return JSON.parse(raw) as LockState;
}

export async function saveLockSnoozeUntil(timestampMs: number | null): Promise<void> {
  if (timestampMs === null) {
    await AsyncStorage.removeItem(appConfig.storageKeys.lockSnoozeUntil);
    return;
  }
  await AsyncStorage.setItem(appConfig.storageKeys.lockSnoozeUntil, String(timestampMs));
}

export async function loadLockSnoozeUntil(): Promise<number | null> {
  const raw = await AsyncStorage.getItem(appConfig.storageKeys.lockSnoozeUntil);
  if (!raw) {
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}
