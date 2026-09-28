import { distanceMeters, formatDistance, isInsideFence, validatePin } from '../src/engine';
import { evaluateLockState, lockReasonMessage } from '../src/modules/lock-engine/evaluate';
import type { RegistrationRecord } from '../src/constants/config';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const base: RegistrationRecord = {
  nombreRegistrado: 'Prueba',
  deviceFingerprint: 'android-test',
  baseLat: -33.4489,
  baseLng: -70.6693,
  radioMetros: 20,
  registeredAt: '2026-09-28T00:00:00.000Z',
};

console.log('[smoke] fence engine v2.2');
assert(isInsideFence(10, 20), '10m debe estar dentro de 20m');
assert(!isInsideFence(25, 20), '25m debe estar fuera de 20m');
assert(formatDistance(85) === '85 m', 'formatDistance metros');
assert(distanceMeters(-33.4489, -70.6693, -33.4490, -70.6693) < 20, 'distancia corta');

console.log('[smoke] pin');
assert(validatePin('1312', '1312'), 'PIN test 1312 válido');
assert(!validatePin('0000', '1312'), 'PIN incorrecto rechazado');

console.log('[smoke] lock policy');
const inside = evaluateLockState({
  registration: base,
  lat: -33.4489,
  lng: -70.6693,
  telefonoEncendido: true,
  airplaneMode: false,
});
assert(!inside.active, 'dentro de 20m no bloquea');
assert(inside.dentroPerimetro, 'flag dentro_perimetro');

const outside = evaluateLockState({
  registration: base,
  lat: -33.4505,
  lng: -70.6693,
  telefonoEncendido: true,
  airplaneMode: false,
});
assert(outside.active, 'fuera de 20m bloquea');
assert(outside.reason === 'outside_fence', 'reason outside_fence');
assert(lockReasonMessage(outside.reason, outside.distanciaBaseM, 20).includes('20 m'), 'mensaje radio');

const airplane = evaluateLockState({
  registration: base,
  lat: -33.4489,
  lng: -70.6693,
  telefonoEncendido: true,
  airplaneMode: true,
});
assert(airplane.active, 'avión bloquea aunque esté en base');
assert(airplane.reason === 'airplane_mode', 'reason airplane_mode');

const off = evaluateLockState({
  registration: base,
  lat: -33.4489,
  lng: -70.6693,
  telefonoEncendido: false,
  airplaneMode: false,
});
assert(off.active, 'apagado/inactivo bloquea');
assert(off.reason === 'phone_off', 'reason phone_off');

console.log('[ok] geo-empresa smoke v2.2');
