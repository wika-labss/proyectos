import { NativeModules, Platform } from 'react-native';

export type AgentStatus = {
  nativeOk: boolean;
  isDeviceOwner: boolean;
  brokerUrl: string | null;
  brokerConfigured: boolean;
  wsConnected: boolean;
  networkOk: boolean;
};

type GeoNative = {
  configureBroker: (wsUrl: string) => Promise<void>;
  getDeviceId: () => Promise<string>;
  startWatchdog: () => Promise<void>;
  moveAppToBackground: () => Promise<void>;
  isDeviceOwner: () => Promise<boolean>;
  getAgentStatus: () => Promise<AgentStatus>;
};

const Native: GeoNative | undefined =
  Platform.OS === 'android' ? NativeModules.GeoEmpresaNative : undefined;

export async function configureBroker(wsUrl: string): Promise<void> {
  if (!Native?.configureBroker) return;
  await Native.configureBroker(wsUrl);
}

export async function getDeviceId(): Promise<string> {
  if (!Native?.getDeviceId) return 'web';
  return Native.getDeviceId();
}

export async function startWatchdog(): Promise<void> {
  if (!Native?.startWatchdog) return;
  await Native.startWatchdog();
}

export async function moveAppToBackground(): Promise<void> {
  if (!Native?.moveAppToBackground) return;
  await Native.moveAppToBackground();
}

export async function isDeviceOwner(): Promise<boolean> {
  if (!Native?.isDeviceOwner) return false;
  return Native.isDeviceOwner();
}

export async function getAgentStatus(): Promise<AgentStatus | null> {
  if (!Native?.getAgentStatus) return null;
  return Native.getAgentStatus();
}
