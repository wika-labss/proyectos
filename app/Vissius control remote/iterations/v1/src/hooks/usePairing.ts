import { usePairingStore } from '../stores/pairingStore';

export function usePairing() {
  const devices = usePairingStore((state) => state.devices);
  const scanning = usePairingStore((state) => state.scanning);
  const scanError = usePairingStore((state) => state.scanError);
  const scan = usePairingStore((state) => state.scan);
  const clear = usePairingStore((state) => state.clear);

  return { devices, scanning, scanError, scan, clear };
}
