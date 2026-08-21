import type { EngineResult, HealthStatus, PetHealth, Symptom } from './types';
import { HEALTH_STATUSES, SYMPTOMS } from './types';

export type SetHealthInput = {
  status: HealthStatus;
  symptoms?: Symptom[];
  notes?: string;
  now?: Date;
};

export function setHealth(input: SetHealthInput): EngineResult<PetHealth> {
  if (!HEALTH_STATUSES.includes(input.status)) {
    return { ok: false, error: { code: 'HEALTH_STATUS_INVALID', message: 'Estado inválido' } };
  }
  const symptoms = (input.symptoms ?? []).filter((s) => SYMPTOMS.includes(s));
  if (input.status === 'enfermo' && symptoms.length < 1) {
    return {
      ok: false,
      error: { code: 'SYMPTOMS_REQUIRED', message: 'Indica al menos un síntoma' },
    };
  }
  const health: PetHealth = {
    status: input.status,
    symptoms: input.status === 'sano' ? [] : symptoms,
    notes: input.notes?.trim() || undefined,
    updatedAt: (input.now ?? new Date()).toISOString(),
  };
  return { ok: true, state: health };
}

export function defaultHealth(now: Date = new Date()): PetHealth {
  return { status: 'sano', symptoms: [], updatedAt: now.toISOString() };
}
