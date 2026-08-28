import type { LockReason, LockState, RegistrationRecord } from '../../constants/config';
import { distanceMeters, isInsideFence } from '../../engine';

export function evaluateLockState(input: {
  registration: RegistrationRecord;
  lat: number;
  lng: number;
  telefonoEncendido: boolean;
  airplaneMode: boolean;
}): LockState {
  const distanciaBaseM = distanceMeters(
    input.lat,
    input.lng,
    input.registration.baseLat,
    input.registration.baseLng,
  );
  const dentroPerimetro = isInsideFence(distanciaBaseM, input.registration.radioMetros);

  let reason: LockReason = 'outside_fence';
  if (input.airplaneMode) {
    reason = 'airplane_mode';
  } else if (!input.telefonoEncendido) {
    reason = 'phone_off';
  } else if (!dentroPerimetro) {
    reason = 'outside_fence';
  }

  const active = input.airplaneMode || !input.telefonoEncendido || !dentroPerimetro;

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
    case 'phone_off':
      return 'El teléfono reporta estado apagado o inactivo.';
    default:
      return `Fuera del perímetro autorizado (${Math.round(distanciaBaseM)} m / máx ${radioMetros} m).`;
  }
}
