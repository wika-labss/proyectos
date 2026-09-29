import type { LockReason, LockState, RegistrationRecord } from '../../constants/config';
import { distanceMeters, isInsideFence } from '../../engine';

const HARD_REASONS: LockReason[] = ['airplane_mode', 'no_internet', 'gps_off', 'no_backend'];

export function isHardLockReason(reason: LockReason): boolean {
  return HARD_REASONS.includes(reason);
}

export function evaluateLockState(input: {
  registration: RegistrationRecord;
  lat: number;
  lng: number;
  telefonoEncendido: boolean;
  airplaneMode: boolean;
  backendReachable?: boolean;
  adminPingFresh?: boolean;
  adminLock?: boolean;
  gpsEnabled?: boolean;
  internetAvailable?: boolean;
}): LockState {
  const distanciaBaseM = distanceMeters(
    input.lat,
    input.lng,
    input.registration.baseLat,
    input.registration.baseLng,
  );
  const dentroPerimetro = isInsideFence(distanciaBaseM, input.registration.radioMetros);
  const backendReachable = input.backendReachable ?? true;
  const adminPingFresh = input.adminPingFresh ?? true;
  const adminLock = input.adminLock ?? false;
  const gpsEnabled = input.gpsEnabled ?? true;
  const internetAvailable = input.internetAvailable ?? true;

  let reason: LockReason = 'outside_fence';
  if (input.airplaneMode) {
    reason = 'airplane_mode';
  } else if (!internetAvailable) {
    reason = 'no_internet';
  } else if (!gpsEnabled) {
    reason = 'gps_off';
  } else if (adminLock) {
    reason = 'admin_lock';
  } else if (!backendReachable) {
    reason = 'no_backend';
  } else if (!adminPingFresh) {
    reason = 'admin_ping';
  } else if (!input.telefonoEncendido) {
    reason = 'phone_off';
  } else if (!dentroPerimetro) {
    reason = 'outside_fence';
  }

  const active =
    input.airplaneMode ||
    !internetAvailable ||
    !gpsEnabled ||
    adminLock ||
    !backendReachable ||
    !adminPingFresh ||
    !input.telefonoEncendido ||
    !dentroPerimetro;

  return {
    active,
    reason,
    distanciaBaseM,
    dentroPerimetro,
    telefonoEncendido: input.telefonoEncendido,
    updatedAt: new Date().toISOString(),
  };
}

export function lockReasonMessage(reason: LockReason, distanciaBaseM: number, radioMetros: number): string {
  switch (reason) {
    case 'airplane_mode':
      return 'Modo avión detectado. Desactívalo para continuar.';
    case 'no_internet':
      return 'Sin internet. Ingresa el PIN corporativo.';
    case 'gps_off':
      return 'GPS apagado. Actívalo e ingresa el PIN corporativo.';
    case 'phone_off':
      return 'El teléfono reporta estado apagado o inactivo.';
    case 'no_backend':
      return 'Sin conexión con la base corporativa. Ingresa el PIN corporativo.';
    case 'admin_ping':
      return 'Sin ping del administrador. Ingresa el PIN corporativo.';
    case 'admin_lock':
      return 'Bloqueo enviado por el administrador. Ingresa el PIN corporativo.';
    default:
      return `Fuera del perímetro autorizado (${Math.round(distanciaBaseM)} m / máx ${radioMetros} m).`;
  }
}
