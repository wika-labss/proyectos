import type { DueStatus, EngineResult, PreventiveItem, PreventiveKind } from './types';
import { newId, PREVENTIVE_KINDS } from './types';

export type AddPreventiveInput = {
  petId: string;
  kind: PreventiveKind;
  name: string;
  appliedAt: string;
  nextDueAt?: string;
  notes?: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function dueStatus(nextDueAt: string | undefined, todayKey: string): DueStatus {
  if (!nextDueAt) return 'ok';
  if (nextDueAt < todayKey) return 'overdue';
  const [ty, tm, td] = todayKey.split('-').map(Number);
  const [ny, nm, nd] = nextDueAt.split('-').map(Number);
  const today = Date.UTC(ty!, tm! - 1, td!);
  const next = Date.UTC(ny!, nm! - 1, nd!);
  const diffDays = Math.round((next - today) / DAY_MS);
  if (diffDays <= 14) return 'soon';
  return 'ok';
}

export function addPreventive(input: AddPreventiveInput): EngineResult<PreventiveItem> {
  if (!input.petId) {
    return { ok: false, error: { code: 'PET_REQUIRED', message: 'Mascota requerida' } };
  }
  if (!PREVENTIVE_KINDS.includes(input.kind)) {
    return { ok: false, error: { code: 'PREVENTIVE_KIND_INVALID', message: 'Tipo inválido' } };
  }
  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: { code: 'PREVENTIVE_NAME_REQUIRED', message: 'Nombre obligatorio' } };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.appliedAt)) {
    return {
      ok: false,
      error: { code: 'PREVENTIVE_APPLIED_REQUIRED', message: 'Fecha aplicada requerida' },
    };
  }
  if (input.nextDueAt) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.nextDueAt)) {
      return { ok: false, error: { code: 'PREVENTIVE_NEXT_INVALID', message: 'Próxima fecha inválida' } };
    }
    if (input.nextDueAt < input.appliedAt) {
      return {
        ok: false,
        error: { code: 'PREVENTIVE_NEXT_BEFORE', message: 'La próxima fecha no puede ser anterior' },
      };
    }
  }
  const item: PreventiveItem = {
    id: newId('prv'),
    petId: input.petId,
    kind: input.kind,
    name,
    appliedAt: input.appliedAt,
    nextDueAt: input.nextDueAt,
    notes: input.notes?.trim() || undefined,
  };
  return { ok: true, state: item };
}
