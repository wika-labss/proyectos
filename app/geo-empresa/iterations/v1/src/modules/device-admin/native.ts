import { NativeModules, Platform } from 'react-native';

type GeoEmpresaNativeModule = {
  isDeviceAdminActive: () => Promise<boolean>;
  requestDeviceAdmin: () => Promise<boolean>;
  removeDeviceAdminWithPin: (pin: string) => Promise<boolean>;
  isAirplaneModeOn: () => Promise<boolean>;
  openAirplaneSettings: () => Promise<void>;
  requestIgnoreBatteryOptimizations: () => Promise<void>;
};

const Native: GeoEmpresaNativeModule | undefined =
  Platform.OS === 'android' ? NativeModules.GeoEmpresaNative : undefined;

export async function isDeviceAdminActive(): Promise<boolean> {
  if (!Native) {
    return false;
  }
  return Native.isDeviceAdminActive();
}

export async function requestDeviceAdmin(): Promise<boolean> {
  if (!Native) {
    return true;
  }
  return Native.requestDeviceAdmin();
}

export async function removeDeviceAdminWithPin(pin: string): Promise<boolean> {
  if (!Native) {
    return pin.length > 0;
  }
  return Native.removeDeviceAdminWithPin(pin);
}

export async function isAirplaneModeOnNative(): Promise<boolean | null> {
  if (!Native) {
    return null;
  }
  return Native.isAirplaneModeOn();
}

export async function openAirplaneSettings(): Promise<void> {
  if (!Native) {
    return;
  }
  await Native.openAirplaneSettings();
}

export async function requestIgnoreBatteryOptimizations(): Promise<void> {
  if (!Native) {
    return;
  }
  await Native.requestIgnoreBatteryOptimizations();
}
