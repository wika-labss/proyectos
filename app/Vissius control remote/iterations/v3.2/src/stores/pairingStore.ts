import { create } from 'zustand';
import { logExec, logFail, logOk, logWarn } from '../diagnostics/logger';
import type { ScanProgress, TvDevice, TvProtocol } from '../types';
import { findTvByIp, scanForTvs } from '../engine/tvRemoteApi';

interface PairingStore {
  devices: TvDevice[];
  scanning: boolean;
  scanError: string | null;
  scanEmpty: boolean;
  progress: ScanProgress | null;
  scan: () => Promise<void>;
  connectByIp: (ip: string, protocol?: TvProtocol) => Promise<TvDevice | null>;
  clear: () => void;
}

export const usePairingStore = create<PairingStore>((set, get) => ({
  devices: [],
  scanning: false,
  scanError: null,
  scanEmpty: false,
  progress: null,

  scan: async () => {
    if (get().scanning) {
      logExec('scan.ui', 'skipped_already_scanning');
      return;
    }

    logExec('scan.ui', 'start Buscar TV');
    set({
      scanning: true,
      scanError: null,
      scanEmpty: false,
      devices: [],
      progress: { scanned: 0, total: 254, found: 0, phase: 'Iniciando…' },
    });

    try {
      const devices = await scanForTvs((progress) => {
        set({ progress, devices: get().devices });
      });
      if (devices.length === 0) {
        logWarn(
          'scan.result',
          'found=0 — misma WiFi que la TV? Anota IP en TV (Ajustes→Red) y usa IP manual',
        );
      } else {
        logOk(
          'scan.result',
          `found=${devices.length} → ${devices.map((d) => `${d.protocol}@${d.ip}`).join(', ')}`,
        );
      }
      set({
        devices,
        scanning: false,
        scanEmpty: devices.length === 0,
        progress: {
          scanned: 254,
          total: 254,
          found: devices.length,
          phase: devices.length > 0 ? `Encontradas ${devices.length} TV(s)` : 'Sin resultados',
        },
      });
    } catch (error) {
      logFail('scan.result', error instanceof Error ? error.message : String(error));
      set({
        scanning: false,
        scanError: 'No se pudieron buscar TVs en la red. Prueba con IP manual.',
        scanEmpty: true,
        devices: [],
        progress: null,
      });
    }
  },

  connectByIp: async (ip, protocol) => {
    logExec('connect.byIp.ui', `ip=${ip} protocol=${protocol ?? 'auto'}`);
    set({ scanning: true, scanError: null, progress: { scanned: 0, total: 1, found: 0, phase: 'Probando IP…' } });
    try {
      const device = await findTvByIp(ip, protocol);
      if (!device) {
        logFail('connect.byIp.ui', 'not_found');
        set({
          scanning: false,
          scanError: 'No hay TV en esa IP. Comprueba IP, WiFi y protocolo.',
          progress: null,
        });
        return null;
      }
      logOk('connect.byIp.ui', `listo ${device.protocol}@${device.ip} — toca Conectar / PIN si Android`);
      set((state) => {
        const exists = state.devices.some((d) => d.id === device.id);
        return {
          scanning: false,
          devices: exists ? state.devices : [device, ...state.devices],
          scanEmpty: false,
          scanError: null,
          progress: { scanned: 1, total: 1, found: 1, phase: 'TV encontrada' },
        };
      });
      return device;
    } catch (error) {
      logFail('connect.byIp.ui', error instanceof Error ? error.message : String(error));
      set({
        scanning: false,
        scanError: 'Error al conectar por IP',
        progress: null,
      });
      return null;
    }
  },

  clear: () => {
    set({
      devices: [],
      scanning: false,
      scanError: null,
      scanEmpty: false,
      progress: null,
    });
  },
}));
