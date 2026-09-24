import { requireNativeModule } from 'expo-modules-core';

export type PolicyStatus = {
  isDeviceOwner: boolean;
  isAdminActive: boolean;
};

type DevicePolicyNative = {
  lockNow: () => void;
  reboot: () => void;
  resetPin: (pin: string) => Promise<void>;
  getPolicyStatus: () => PolicyStatus;
  ensureResetPasswordToken: () => Promise<boolean>;
};

class PolicyUnavailableError extends Error {
  constructor() {
    super('DevicePolicy nativo no disponible. Requiere APK Android (no Expo Go).');
    this.name = 'PolicyUnavailableError';
  }
}

function getNative(): DevicePolicyNative {
  try {
    return requireNativeModule<DevicePolicyNative>('DevicePolicy');
  } catch {
    throw new PolicyUnavailableError();
  }
}

export function lockNow(): void {
  getNative().lockNow();
}

export function reboot(): void {
  getNative().reboot();
}

export async function resetPin(pin: string): Promise<void> {
  await getNative().resetPin(pin);
}

export function getPolicyStatus(): PolicyStatus {
  try {
    return getNative().getPolicyStatus();
  } catch {
    return { isDeviceOwner: false, isAdminActive: false };
  }
}

export async function ensureResetPasswordToken(): Promise<boolean> {
  try {
    return await getNative().ensureResetPasswordToken();
  } catch {
    return false;
  }
}

export { PolicyUnavailableError };
