import { NativeModules, Platform } from 'react-native';

type GeoEmpresaNativeModule = {
  isDeviceAdminActive: () => Promise<boolean>;
  requestDeviceAdmin: () => Promise<boolean>;
  removeDeviceAdminWithPin: (pin: string) => Promise<boolean>;
  isAirplaneModeOn: () => Promise<boolean>;
  openAirplaneSettings: () => Promise<void>;
  requestIgnoreBatteryOptimizations: () => Promise<void>;
  requestOverlayPermission: () => Promise<void>;
  showSecurityLock: (title: string, message: string) => Promise<void>;
  lockDevice: (title: string, message: string) => Promise<void>;
  lockDeviceForced: (title: string, message: string) => Promise<void>;
  hideSecurityLock: () => Promise<void>;
  startLockTask: () => Promise<void>;
  stopLockTask: () => Promise<void>;
  startWatchdog: () => Promise<void>;
  configureAgent: (url: string, anonKey: string, fingerprint: string) => Promise<void>;
  isLockTaskActive: () => Promise<boolean>;
  moveAppToBackground: () => Promise<void>;
  bringAppToForeground: () => Promise<void>;
};

const Native: GeoEmpresaNativeModule | undefined =
  Platform.OS === 'android' ? NativeModules.GeoEmpresaNative : undefined;

export async function isDeviceAdminActive(): Promise<boolean> {
  if (!Native) return false;
  return Native.isDeviceAdminActive();
}

export async function requestDeviceAdmin(): Promise<boolean> {
  if (!Native) return true;
  return Native.requestDeviceAdmin();
}

export async function removeDeviceAdminWithPin(pin: string): Promise<boolean> {
  if (!Native) return pin.length > 0;
  return Native.removeDeviceAdminWithPin(pin);
}

export async function isAirplaneModeOnNative(): Promise<boolean | null> {
  if (!Native) return null;
  return Native.isAirplaneModeOn();
}

export async function openAirplaneSettings(): Promise<void> {
  if (!Native) return;
  await Native.openAirplaneSettings();
}

export async function requestIgnoreBatteryOptimizations(): Promise<void> {
  if (!Native) return;
  await Native.requestIgnoreBatteryOptimizations();
}

export async function requestOverlayPermission(): Promise<void> {
  if (!Native) return;
  await Native.requestOverlayPermission();
}

export async function showSecurityLock(title: string, message: string): Promise<void> {
  if (!Native) return;
  if (Native.lockDevice) {
    await Native.lockDevice(title, message);
    return;
  }
  await Native.showSecurityLock(title, message);
}

export async function lockDevice(title: string, message: string): Promise<void> {
  await showSecurityLock(title, message);
}

export async function hideSecurityLock(): Promise<void> {
  if (!Native) return;
  await Native.hideSecurityLock();
}

export async function startLockTask(): Promise<void> {
  if (!Native) return;
  await Native.startLockTask();
}

export async function stopLockTask(): Promise<void> {
  if (!Native) return;
  await Native.stopLockTask();
}

export async function moveAppToBackground(): Promise<void> {
  if (!Native) return;
  await Native.moveAppToBackground();
}

export async function bringAppToForeground(): Promise<void> {
  if (!Native) return;
  await Native.bringAppToForeground();
}

export async function lockDeviceForced(title: string, message: string): Promise<void> {
  if (!Native) return;
  if (Native.lockDeviceForced) {
    await Native.lockDeviceForced(title, message);
    return;
  }
  await showSecurityLock(title, message);
}

export async function startWatchdog(): Promise<void> {
  if (!Native?.startWatchdog) return;
  await Native.startWatchdog();
}

export async function configureAgent(url: string, anonKey: string, fingerprint: string): Promise<void> {
  if (!Native?.configureAgent) return;
  await Native.configureAgent(url, anonKey, fingerprint);
}

export async function isLockTaskActive(): Promise<boolean> {
  if (!Native?.isLockTaskActive) return false;
  return Native.isLockTaskActive();
}
