import type { BathroomType, Severity, StoolCode } from './types';
import { STOOL_CODES } from './types';

export type StoolMeta = { code: StoolCode; label: string; severity: Severity };

const CATALOG: Record<StoolCode, StoolMeta> = {
  firme: { code: 'firme', label: 'Firme / normal', severity: 'ok' },
  dura: { code: 'dura', label: 'Dura / seca', severity: 'warning' },
  blanda: { code: 'blanda', label: 'Blanda', severity: 'warning' },
  liquida: { code: 'liquida', label: 'Líquida / diarrea', severity: 'error' },
  moco: { code: 'moco', label: 'Con moco', severity: 'error' },
  sangre: { code: 'sangre', label: 'Con sangre', severity: 'error' },
};

export function listStoolMeta(): StoolMeta[] {
  return STOOL_CODES.map((c) => CATALOG[c]);
}

export function getStoolMeta(code: StoolCode): StoolMeta {
  return CATALOG[code];
}

export function requiresStool(bathroomType: BathroomType): boolean {
  return bathroomType === 'heces' || bathroomType === 'ambos';
}

export function isValidStool(code: string): code is StoolCode {
  return (STOOL_CODES as string[]).includes(code);
}
