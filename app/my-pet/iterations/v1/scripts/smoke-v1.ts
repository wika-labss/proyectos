/**
 * Smoke V1 — engine puro (sin React Native).
 * Run: npm run smoke
 */
import assert from 'node:assert/strict';
import {
  DEFAULT_ALERT_COOLDOWN_MS,
  SPECIES,
  alertsForPet,
  buildPrintUrl,
  buildPublicUrl,
  buildQrPngUrl,
  createPet,
  createPetInStore,
  emptyStore,
  formatDistance,
  haversineMeters,
  markAlertSeen,
  publicPetView,
  reportFound,
  seedDemoStore,
  unseenCount,
} from '../src/engine';

function testCreatePetValidation() {
  const missingName = createPet({
    name: '  ',
    species: 'perro',
    address: 'Calle 1',
    homeLat: -33.4,
    homeLng: -70.6,
  });
  assert.equal(missingName.ok, false);
  if (!missingName.ok) assert.equal(missingName.error.code, 'PET_NAME_REQUIRED');

  const badSpecies = createPet({
    name: 'Luna',
    species: 'dragón',
    address: 'Calle 1',
    homeLat: -33.4,
    homeLng: -70.6,
  });
  assert.equal(badSpecies.ok, false);

  const badCoords = createPet({
    name: 'Luna',
    species: 'perro',
    address: 'Calle 1',
    homeLat: 999,
    homeLng: -70.6,
  });
  assert.equal(badCoords.ok, false);
  if (!badCoords.ok) assert.equal(badCoords.error.code, 'PET_COORDS_INVALID');
}

function testCreateAndQrUrls() {
  const created = createPet({
    name: 'Luna',
    species: 'perro',
    address: 'Av. Demo 123',
    homeLat: -33.4372,
    homeLng: -70.6506,
    publicToken: 'demo-luna',
    now: new Date('2026-08-31T12:00:00.000Z'),
  });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  assert.equal(created.state.publicToken, 'demo-luna');
  assert.ok(SPECIES.includes(created.state.species));

  const base = 'http://127.0.0.1:8787/';
  assert.equal(buildPublicUrl(base, 'demo-luna'), 'http://127.0.0.1:8787/p/demo-luna');
  assert.equal(buildPrintUrl(base, 'demo-luna'), 'http://127.0.0.1:8787/print/demo-luna');
  assert.equal(buildQrPngUrl(base, 'demo-luna'), 'http://127.0.0.1:8787/qr/demo-luna.png');

  const pub = publicPetView(created.state);
  assert.equal(pub.name, 'Luna');
  assert.equal('address' in pub, false);
}

function testAlertAndDistance() {
  let store = seedDemoStore();
  const pet = store.pets[0]!;
  const found = { lat: -33.4489, lng: -70.6693 };
  const meters = haversineMeters(
    { lat: pet.homeLat, lng: pet.homeLng },
    found,
  );
  assert.ok(meters > 1000 && meters < 5000, `expected a few km, got ${meters}`);
  assert.equal(formatDistance(250), '250 m');
  assert.equal(formatDistance(1500), '1.5 km');

  const first = reportFound(store, {
    token: 'demo-luna',
    foundLat: found.lat,
    foundLng: found.lng,
    accuracyMeters: 12,
    now: new Date('2026-08-31T15:00:00.000Z'),
  });
  assert.equal(first.ok, true);
  if (!first.ok) return;
  store = first.state;
  assert.equal(unseenCount(store), 1);
  const alert = alertsForPet(store, pet.id)[0]!;
  assert.equal(alert.status, 'new');
  assert.equal(alert.foundLat, found.lat);

  const spam = reportFound(store, {
    token: 'demo-luna',
    foundLat: found.lat,
    foundLng: found.lng,
    now: new Date('2026-08-31T15:01:00.000Z'),
    cooldownMs: DEFAULT_ALERT_COOLDOWN_MS,
  });
  assert.equal(spam.ok, false);
  if (!spam.ok) assert.equal(spam.error.code, 'ALERT_COOLDOWN');

  const later = reportFound(store, {
    token: 'demo-luna',
    foundLat: found.lat,
    foundLng: found.lng,
    now: new Date('2026-08-31T15:10:00.000Z'),
  });
  assert.equal(later.ok, true);
  if (!later.ok) return;
  store = later.state;
  assert.equal(alertsForPet(store, pet.id).length, 2);

  const seen = markAlertSeen(store, alert.id);
  assert.equal(seen.ok, true);
  if (!seen.ok) return;
  assert.equal(unseenCount(seen.state), 1);
}

function testUnknownTokenAndDuplicate() {
  let store = emptyStore();
  const missing = reportFound(store, { token: 'nope' });
  assert.equal(missing.ok, false);

  const a = createPetInStore(store, {
    name: 'Mora',
    species: 'gato',
    address: 'Calle 2',
    homeLat: -33.4,
    homeLng: -70.6,
    publicToken: 'mora-token',
  });
  assert.equal(a.ok, true);
  if (!a.ok) return;
  store = a.state;
  const dup = createPetInStore(store, {
    name: 'Otra',
    species: 'gato',
    address: 'Calle 3',
    homeLat: -33.41,
    homeLng: -70.61,
    publicToken: 'mora-token',
  });
  assert.equal(dup.ok, false);

  const noGps = reportFound(store, {
    token: 'mora-token',
    foundLat: null,
    foundLng: null,
    now: new Date('2026-08-31T16:00:00.000Z'),
  });
  assert.equal(noGps.ok, true);
  if (!noGps.ok) return;
  assert.equal(noGps.state.alerts[0]!.foundLat, null);
}

function main() {
  testCreatePetValidation();
  testCreateAndQrUrls();
  testAlertAndDistance();
  testUnknownTokenAndDuplicate();
  console.log('smoke-v1: all passed');
}

main();
