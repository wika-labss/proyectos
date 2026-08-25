import type { ResumenDia, ResumenEstado, ResumenPayload, ResumenRubro } from './types';

export type ChartBar = {
  key: string;
  label: string;
  value: number;
  codigo?: string | number;
};

export function toEstadoBars(rows: ResumenEstado[]): ChartBar[] {
  return rows
    .filter((row) => row.n > 0)
    .map((row) => ({
      key: `e-${row.codigo}`,
      label: `${row.nombre} (${row.n})`,
      value: row.n,
      codigo: row.codigo,
    }));
}

export function toRubroBars(rows: ResumenRubro[]): ChartBar[] {
  return rows.map((row) => ({
    key: `r-${row.codigo}`,
    label: `${row.codigo} ${row.nombre} (${row.n})`,
    value: row.n,
    codigo: row.codigo,
  }));
}

export function toDiaBars(rows: ResumenDia[]): ChartBar[] {
  return rows.map((row) => ({
    key: `d-${row.fecha}`,
    label: `${row.fecha.slice(5)} (${row.n})`,
    value: row.n,
    codigo: row.fecha,
  }));
}

export function chartMax(bars: ChartBar[]): number {
  return bars.reduce((max, bar) => Math.max(max, bar.value), 0);
}

export function isEmptyResumen(payload: ResumenPayload | null | undefined): boolean {
  if (!payload) return true;
  const estados = payload.por_estado?.reduce((sum, row) => sum + row.n, 0) ?? 0;
  return estados === 0;
}
