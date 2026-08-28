import { distanceMeters, formatDistance, isInsideFence, validatePin } from '../src/engine';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

console.log('[smoke] fence engine v2');
assert(isInsideFence(100, 120), '100m debe estar dentro de 120m');
assert(!isInsideFence(150, 120), '150m debe estar fuera de 120m');
assert(formatDistance(85) === '85 m', 'formatDistance metros');
assert(distanceMeters(-33.4489, -70.6693, -33.4490, -70.6693) < 20, 'distancia corta');

console.log('[smoke] pin');
assert(validatePin('1312', '1312'), 'PIN test 1312 válido');
assert(!validatePin('0000', '1312'), 'PIN incorrecto rechazado');

console.log('[ok] geo-empresa smoke v2');
