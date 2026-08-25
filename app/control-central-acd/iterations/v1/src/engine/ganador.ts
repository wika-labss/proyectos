import type { GanadorPayload } from './types';

export function itemsTotal(payload: Pick<GanadorPayload, 'items' | 'monto_adjudicado'>): number | null {
  const fromItems = (payload.items ?? []).reduce((sum, item) => sum + Number(item.subtotal ?? 0), 0);
  if (fromItems > 0) return fromItems;
  if (payload.monto_adjudicado != null) return Number(payload.monto_adjudicado);
  return null;
}

export function pctEstimado(payload: Pick<GanadorPayload, 'monto_estimado' | 'monto_adjudicado' | 'items'>): number | null {
  const estimado = Number(payload.monto_estimado ?? 0);
  if (!estimado) return null;
  const ganado = itemsTotal(payload);
  if (ganado === null) return null;
  return Math.round((ganado / estimado) * 1000) / 10;
}

export function canOpenActa(payload: Pick<GanadorPayload, 'tiene_acta' | 'url_acta'>): boolean {
  return Boolean(payload.tiene_acta && payload.url_acta);
}

export function canOpenFicha(payload: Pick<GanadorPayload, 'url_ficha'>): boolean {
  return Boolean(payload.url_ficha);
}

export function primaryProveedor(payload: Pick<GanadorPayload, 'items'>): { rut: string; nombre: string } | null {
  const first = payload.items?.[0];
  if (!first?.rut_proveedor) return null;
  return { rut: first.rut_proveedor, nombre: first.nombre_proveedor ?? first.rut_proveedor };
}
