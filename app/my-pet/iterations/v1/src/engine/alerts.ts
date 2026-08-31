import { isValidLat, isValidLng } from './geo';
import { newId } from './ids';
import { getPetByToken } from './petRegistry';
import {
  DEFAULT_ALERT_COOLDOWN_MS,
  type AppStore,
  type EngineResult,
  type FindAlert,
  type ReportFoundInput,
} from './types';

export function alertsForPet(store: AppStore, petId: string): FindAlert[] {
  return store.alerts
    .filter((a) => a.petId === petId)
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function unseenCount(store: AppStore, petId?: string): number {
  return store.alerts.filter(
    (a) => a.status === 'new' && (petId == null || a.petId === petId),
  ).length;
}

export function markAlertSeen(store: AppStore, alertId: string): EngineResult<AppStore> {
  const exists = store.alerts.some((a) => a.id === alertId);
  if (!exists) {
    return { ok: false, error: { code: 'ALERT_NOT_FOUND', message: 'Alerta no encontrada' } };
  }
  return {
    ok: true,
    state: {
      ...store,
      alerts: store.alerts.map((a) => (a.id === alertId ? { ...a, status: 'seen' } : a)),
    },
  };
}

export function reportFound(store: AppStore, input: ReportFoundInput): EngineResult<AppStore> {
  const token = input.token.trim();
  const pet = getPetByToken(store, token);
  if (!pet) {
    return { ok: false, error: { code: 'ALERT_UNKNOWN_TOKEN', message: 'Mascota no encontrada' } };
  }

  const now = input.now ?? new Date();
  const cooldownMs = input.cooldownMs ?? DEFAULT_ALERT_COOLDOWN_MS;
  const last = alertsForPet(store, pet.id)[0];
  if (last && cooldownMs > 0) {
    const elapsed = now.getTime() - new Date(last.createdAt).getTime();
    if (elapsed >= 0 && elapsed < cooldownMs) {
      return {
        ok: false,
        error: {
          code: 'ALERT_COOLDOWN',
          message: 'Ya se avisó hace poco. Espera unos minutos para no saturar al dueño.',
        },
      };
    }
  }

  let foundLat: number | null = input.foundLat ?? null;
  let foundLng: number | null = input.foundLng ?? null;
  if (foundLat != null || foundLng != null) {
    if (foundLat == null || foundLng == null || !isValidLat(foundLat) || !isValidLng(foundLng)) {
      return {
        ok: false,
        error: { code: 'ALERT_COORDS_INVALID', message: 'Coordenadas de hallazgo inválidas' },
      };
    }
  }

  const accuracy =
    input.accuracyMeters != null && Number.isFinite(input.accuracyMeters)
      ? input.accuracyMeters
      : null;

  const alert: FindAlert = {
    id: newId('alert'),
    petId: pet.id,
    publicToken: pet.publicToken,
    foundLat,
    foundLng,
    accuracyMeters: accuracy,
    createdAt: now.toISOString(),
    status: 'new',
    usedDemoLocation: Boolean(input.usedDemoLocation),
  };

  return { ok: true, state: { ...store, alerts: [...store.alerts, alert] } };
}
