import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { appConfig, type RegistrationRecord } from '../../constants/config';

export async function buildDeviceFingerprint(): Promise<string> {
  const androidId = Application.getAndroidId?.();
  if (androidId) {
    return `android-${androidId}`;
  }
  const model = Device.modelName ?? 'unknown';
  const os = Device.osVersion ?? '0';
  return `fallback-${model}-${os}`.replace(/\s+/g, '-').toLowerCase();
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
