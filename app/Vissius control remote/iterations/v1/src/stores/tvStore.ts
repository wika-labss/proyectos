import { create } from 'zustand';
import type { ConnectionState, RemoteCommand, TvDevice, TvStatus } from '../types';
import { connectToTv, disconnectFromTv, sendRemoteCommand } from '../engine/tvRemoteApi';
import { clearPairedDevice, loadPreferences, savePairedDevice } from '../utils/storage';

interface TvStore {
  loaded: boolean;
  connectionState: ConnectionState;
  pairedDevice: TvDevice | null;
  status: TvStatus;
  error: string | null;
  sendingCommand: boolean;
  load: () => Promise<void>;
  connect: (device: TvDevice) => Promise<boolean>;
  reconnect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  forgetDevice: () => Promise<void>;
  sendCommand: (command: RemoteCommand) => Promise<void>;
}

const defaultStatus: TvStatus = {
  power: false,
  volume: 0,
  activeApp: null,
  lastCommand: null,
};

export const useTvStore = create<TvStore>((set, get) => ({
  loaded: false,
  connectionState: 'idle',
  pairedDevice: null,
  status: defaultStatus,
  error: null,
  sendingCommand: false,

  load: async () => {
    const preferences = await loadPreferences();
    set({ pairedDevice: preferences.pairedDevice, loaded: true });

    if (preferences.pairedDevice) {
      set({ connectionState: 'connecting', error: null });
      try {
        const status = await connectToTv(preferences.pairedDevice);
        set({ connectionState: 'connected', status, error: null });
      } catch {
        set({
          connectionState: 'disconnected',
          status: defaultStatus,
          error: 'No se pudo reconectar con la TV',
        });
      }
    }
  },

  connect: async (device) => {
    const { connectionState } = get();
    if (connectionState === 'connecting') {
      return false;
    }

    set({ connectionState: 'connecting', error: null });
    try {
      const status = await connectToTv(device);
      await savePairedDevice(device);
      set({
        connectionState: 'connected',
        pairedDevice: device,
        status,
        error: null,
      });
      return true;
    } catch {
      set({
        connectionState: 'error',
        error: 'No se pudo conectar con la TV',
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
    await disconnectFromTv();
    set({
      connectionState: 'disconnected',
      status: defaultStatus,
      sendingCommand: false,
    });
  },

  forgetDevice: async () => {
    await disconnectFromTv();
    await clearPairedDevice();
    set({
      connectionState: 'idle',
      pairedDevice: null,
      status: defaultStatus,
      error: null,
      sendingCommand: false,
    });
  },

  sendCommand: async (command) => {
    const { connectionState, sendingCommand } = get();
    if (connectionState !== 'connected') {
      set({ error: 'TV no conectada', connectionState: 'disconnected' });
      return;
    }
    if (sendingCommand) {
      return;
    }

    set({ sendingCommand: true, error: null });
    try {
      const status = await sendRemoteCommand(command);
      set({ status, connectionState: 'connected', sendingCommand: false });
    } catch {
      await disconnectFromTv();
      set({
        error: 'Error al enviar comando',
        connectionState: 'disconnected',
        status: defaultStatus,
        sendingCommand: false,
      });
    }
  },
}));
