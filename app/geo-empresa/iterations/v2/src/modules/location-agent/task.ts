import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { appConfig } from '../../constants/config';
import { reportarUbicacion } from '../../engine';
import {
  showSecurityLock,
} from '../device-admin/native';
import { evaluateLockState, lockReasonMessage } from '../lock-engine/evaluate';
import {
  loadLastLocation,
  loadLockSnoozeUntil,
  loadPhoneOn,
  loadRegistration,
  saveLastLocation,
  saveLockState,
} from '../registration/store';

async function applyLockSideEffects(
  state: ReturnType<typeof evaluateLockState>,
  registration: Awaited<ReturnType<typeof loadRegistration>>,
): Promise<void> {
  await saveLockState(state);

  if (!state.active || !registration) {
    return;
  }

  const snoozeUntil = await loadLockSnoozeUntil();
  if (snoozeUntil && Date.now() < snoozeUntil) {
    return;
  }

  const message = lockReasonMessage(state.reason, state.distanciaBaseM, registration.radioMetros);
  await showSecurityLock('Teléfono bloqueado', message);
}

export async function sendLocationPing(telefonoEncendido: boolean, airplaneMode = false): Promise<void> {
  const registration = await loadRegistration();
  if (!registration) {
    return;
  }

  let lat: number;
  let lng: number;
  let accuracyM: number | undefined;

  try {
    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    lat = current.coords.latitude;
    lng = current.coords.longitude;
    accuracyM = current.coords.accuracy ?? undefined;
    await saveLastLocation({ lat, lng, accuracyM });
  } catch {
    const cached = await loadLastLocation();
    if (!cached) {
      lat = registration.baseLat;
      lng = registration.baseLng;
    } else {
      lat = cached.lat;
      lng = cached.lng;
      accuracyM = cached.accuracyM;
    }
  }

  const lockState = evaluateLockState({
    registration,
    lat,
    lng,
    telefonoEncendido,
    airplaneMode,
  });

  await applyLockSideEffects(lockState, registration);

  try {
    await reportarUbicacion({
      deviceFingerprint: registration.deviceFingerprint,
      lat,
      lng,
      precisionM: accuracyM,
      telefonoEncendido,
    });
  } catch (error) {
    console.warn('[geo-empresa] reportar_ubicacion failed', error);
  }
}

export async function sendPowerStateReport(
  telefonoEncendido: boolean,
  airplaneMode = false,
): Promise<void> {
  await sendLocationPing(telefonoEncendido, airplaneMode);
}

TaskManager.defineTask(appConfig.backgroundLocationTask, async () => {
  const phoneOn = await loadPhoneOn();
  try {
    await sendLocationPing(phoneOn, false);
  } catch (error) {
    console.warn('[geo-empresa] background ping failed', error);
  }
});

export async function startBackgroundMonitoring(): Promise<void> {
  const { status: foreground } = await Location.requestForegroundPermissionsAsync();
  if (foreground !== 'granted') {
    throw new Error('Permiso de ubicación en primer plano denegado.');
  }

  const { status: background } = await Location.requestBackgroundPermissionsAsync();
  if (background !== 'granted') {
    throw new Error('Permiso de ubicación permanente denegado.');
  }

  const started = await Location.hasStartedLocationUpdatesAsync(appConfig.backgroundLocationTask);
  if (started) {
    await Location.stopLocationUpdatesAsync(appConfig.backgroundLocationTask);
  }

  await Location.startLocationUpdatesAsync(appConfig.backgroundLocationTask, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: appConfig.pingIntervalMs,
    distanceInterval: 0,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'Geo Empresa activo',
      notificationBody: 'Monitoreo corporativo cada 5 minutos',
    },
    pausesUpdatesAutomatically: false,
  });
}

export async function stopBackgroundMonitoring(): Promise<void> {
  const started = await Location.hasStartedLocationUpdatesAsync(appConfig.backgroundLocationTask);
  if (started) {
    await Location.stopLocationUpdatesAsync(appConfig.backgroundLocationTask);
  }
}
