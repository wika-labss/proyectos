import { create } from 'zustand';
import type { ConnectionState, FeedbackMessage, RemoteCommand, TvDevice, TvStatus } from '../types';
import {
  connectToTv,
  disconnectFromTv,
  sendRemoteCommand,
} from '../engine/tvRemoteApi';
import { logExec, logFail, logOk, logWarn } from '../diagnostics/logger';
import { clearPairedDevice, loadPreferences, savePairedDevice } from '../utils/storage';

interface TvStore {
  loaded: boolean;
  connectionState: ConnectionState;
  pairedDevice: TvDevice | null;
  status: TvStatus;
  error: string | null;
  feedback: FeedbackMessage | null;
  sendingCommand: boolean;
  load: () => Promise<void>;
  connect: (device: TvDevice) => Promise<boolean>;
  reconnect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  forgetDevice: () => Promise<void>;
  leaveForPairing: () => Promise<void>;
  sendCommand: (command: RemoteCommand) => Promise<void>;
  clearFeedback: () => void;
}

const defaultStatus: TvStatus = {
  power: false,
  volume: 0,
  muted: true,
  activeApp: null,
  activeInput: null,
  lastCommand: null,
};

export const useTvStore = create<TvStore>((set, get) => ({
  loaded: false,
  connectionState: 'idle',
  pairedDevice: null,
  status: defaultStatus,
  error: null,
  feedback: null,
  sendingCommand: false,

  load: async () => {
    const preferences = await loadPreferences();
    set({ pairedDevice: preferences.pairedDevice, loaded: true });

    if (!preferences.pairedDevice) {
      logExec('app.session', 'sin TV emparejada — ir a Emparejar');
      return;
    }

    set({ connectionState: 'connecting', error: null });
    logExec(
      'app.reconnect',
      `intentando ${preferences.pairedDevice.protocol}@${preferences.pairedDevice.ip}`,
    );
    try {
      const status = await connectToTv(preferences.pairedDevice);
      set({
        connectionState: 'connected',
        status,
        error: null,
        feedback: {
          text: `Conectado exitosamente a ${preferences.pairedDevice.name}`,
          tone: 'success',
        },
      });
      logOk('app.reconnect', 'ok');
    } catch {
      set({
        connectionState: 'disconnected',
        status: defaultStatus,
        error: 'No se pudo reconectar con la TV',
      });
      logFail(
        'app.reconnect',
        `fail ${preferences.pairedDevice.protocol}@${preferences.pairedDevice.ip} — Olvidar TV o misma WiFi`,
      );
    }
  },

  connect: async (device) => {
    const { connectionState } = get();
    if (connectionState === 'connecting') {
      return false;
    }

    set({ connectionState: 'connecting', error: null, feedback: null });
    try {
      const status = await connectToTv(device);
      await savePairedDevice(device);
      set({
        connectionState: 'connected',
        pairedDevice: device,
        status,
        error: null,
        feedback: {
          text: `Conectado exitosamente a ${device.name}`,
          tone: 'success',
        },
      });
      return true;
    } catch {
      set({
        connectionState: 'error',
        error: 'No se pudo conectar con la TV',
        feedback: {
          text: 'No se pudo conectar con la TV. Comprueba que está encendida y en la misma WiFi.',
          tone: 'error',
        },
      });
      return false;
    }
  },

  reconnect: async () => {
    const { pairedDevice } = get();
    if (!pairedDevice) {
      return false;
    }
    return get().connect(pairedDevice);
  },

  disconnect: async () => {
    const { pairedDevice } = get();
    await disconnectFromTv(pairedDevice);
    set({
      connectionState: 'disconnected',
      status: defaultStatus,
      sendingCommand: false,
    });
  },

  forgetDevice: async () => {
    const { pairedDevice } = get();
    logWarn(
      'app.forget',
      pairedDevice ? `olvidando ${pairedDevice.protocol}@${pairedDevice.ip}` : 'sin dispositivo',
    );
    await disconnectFromTv(pairedDevice);
    await clearPairedDevice();
    set({
      connectionState: 'idle',
      pairedDevice: null,
      status: defaultStatus,
      error: null,
      feedback: null,
      sendingCommand: false,
    });
  },

  leaveForPairing: async () => {
    const { pairedDevice, sendingCommand } = get();
    if (sendingCommand) {
      return;
    }
    await disconnectFromTv(pairedDevice);
    set({
      connectionState: 'idle',
      pairedDevice: null,
      status: defaultStatus,
      error: null,
      feedback: null,
      sendingCommand: false,
    });
  },

  sendCommand: async (command) => {
    const { connectionState, sendingCommand, pairedDevice, status } = get();
    if (!pairedDevice) {
      set({ error: 'TV no seleccionada', connectionState: 'disconnected' });
      return;
    }
    if (connectionState !== 'connected') {
      set({ error: 'TV no conectada', connectionState: 'disconnected' });
      return;
    }
    if (sendingCommand) {
      return;
    }

    set({ sendingCommand: true, error: null });
    try {
      const nextStatus = await sendRemoteCommand(pairedDevice, command, status);
      set({
        status: { ...nextStatus, lastCommand: command },
        connectionState: 'connected',
        sendingCommand: false,
      });
    } catch {
      set({
        error: 'Error al enviar comando',
        connectionState: 'disconnected',
        status: defaultStatus,
        sendingCommand: false,
        feedback: {
          text: 'Se perdió la conexión con la TV',
          tone: 'error',
        },
      });
    }
  },

  clearFeedback: () => {
    set({ feedback: null });
  },
}));
