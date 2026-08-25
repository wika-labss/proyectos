import type { EstadoRef, LicitacionCard } from './types';

export function estadoTokenKey(codigo: number): 'publicada' | 'cerrada' | 'adjudicada' | 'desierta' | 'otro' {
  if (codigo === 5) return 'publicada';
  if (codigo === 6) return 'cerrada';
  if (codigo === 8) return 'adjudicada';
  if (codigo === 7) return 'desierta';
  return 'otro';
}

export function canOpenPerfil(card: Pick<LicitacionCard, 'tiene_ganador'>): boolean {
  return card.tiene_ganador === true;
}

export function estadoLabel(estado: EstadoRef): string {
  return estado.nombre;
}

export function formatMonto(value: number | null | undefined, moneda = 'CLP'): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  const n = Math.round(Number(value));
  const formatted = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return moneda === 'CLP' ? `$${formatted}` : `${formatted} ${moneda}`;
}
