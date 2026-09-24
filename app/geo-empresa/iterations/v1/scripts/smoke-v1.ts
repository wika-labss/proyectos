import assert from 'node:assert/strict';
import { inferTelefonoEncendido, isInsideFence, shouldLock } from '../src/engine';

function testFence() {
  assert.equal(isInsideFence(119, 120), true);
  assert.equal(isInsideFence(120, 120), true);
  assert.equal(isInsideFence(121, 120), false);
}

function testShouldLock() {
  assert.equal(
    shouldLock({
      estadoEnrollment: 'aprobado',
      politicaAutolock: true,
      dentroPerimetro: false,
      esDeviceOwner: true,
    }),
    true,
  );
  assert.equal(
    shouldLock({
      estadoEnrollment: 'pendiente',
      politicaAutolock: true,
      dentroPerimetro: false,
      esDeviceOwner: true,
    }),
    false,
  );
  assert.equal(
    shouldLock({
      estadoEnrollment: 'aprobado',
      politicaAutolock: false,
      dentroPerimetro: false,
      esDeviceOwner: true,
    }),
    false,
  );
  assert.equal(
    shouldLock({
      estadoEnrollment: 'aprobado',
      politicaAutolock: true,
      dentroPerimetro: false,
      esDeviceOwner: false,
    }),
    false,
  );
}

function testEncendido() {
  assert.equal(inferTelefonoEncendido(true), true);
  assert.equal(inferTelefonoEncendido(false), false);
}

testFence();
testShouldLock();
testEncendido();
console.log('smoke-v1 ok');
