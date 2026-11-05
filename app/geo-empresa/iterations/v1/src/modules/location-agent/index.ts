import * as Location from 'expo-location';
import { config } from '../../constants/config';
import { inferTelefonoEncendido, reportarUbicacion, shouldLock } from '../../engine';
import { getPolicyStatus, lockNow } from '../device-policy';

export async function requestLocationPermission(): Promise<boolean> {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== 'granted') return false;
  await Location.requestBackgroundPermissionsAsync().catch(() => undefined);
  return true;
}

export async function pingOnce(fingerprint: string): Promise<void> {
  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  const policy = getPolicyStatus();
  const snapshot = await reportarUbicacion({
    fingerprint,
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
    precisionM: pos.coords.accuracy ?? undefined,
    telefonoEncendido: inferTelefonoEncendido(true),
  });

  const lock = snapshot.debe_bloquear === true || shouldLock({
    estadoEnrollment: snapshot.estado_enrollment,
    politicaAutolock: snapshot.politica_autolock,
    dentroPerimetro: snapshot.dentro_perimetro,
    esDeviceOwner: policy.isDeviceOwner,
  });

  if (lock && policy.isDeviceOwner) {
    lockNow();
  }
}

export function startLocationLoop(fingerprint: string): () => void {
  let cancelled = false;
  const run = async () => {
    if (cancelled) return;
    try {
      await pingOnce(fingerprint);
    } catch {
      // reintento en el siguiente ciclo
    }
  };
  void run();
  const id = setInterval(() => {
    void run();
  }, config.locationIntervalMs);
  return () => {
    cancelled = true;
    clearInterval(id);
  };
}
