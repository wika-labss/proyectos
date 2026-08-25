export type TipoLicitacion = 'L1' | 'LE' | 'LP';

export type QueryFilter = {
  desde: string | null;
  hasta: string | null;
  rubro: string | null;
  tipo: TipoLicitacion | null;
  estados: number[] | null;
};

export const TIPOS: TipoLicitacion[] = ['L1', 'LE', 'LP'];

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function todayIso(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function defaultFilter(now = new Date()): QueryFilter {
  const hasta = todayIso(now);
  return {
    desde: addDaysIso(hasta, -30),
    hasta,
    rubro: null,
    tipo: null,
    estados: null,
  };
}

export function presetRange(days: number, now = new Date()): Pick<QueryFilter, 'desde' | 'hasta'> {
  const hasta = todayIso(now);
  if (days <= 0) {
    return { desde: null, hasta: null };
  }
  return { desde: addDaysIso(hasta, -days), hasta };
}

export function isIsoDate(value: string | null): boolean {
  return value === null || ISO.test(value);
}

export function normalizeFilter(input: Partial<QueryFilter> | null | undefined): QueryFilter {
  const base = defaultFilter();
  const next: QueryFilter = {
    desde: input?.desde === undefined ? base.desde : input.desde,
    hasta: input?.hasta === undefined ? base.hasta : input.hasta,
    rubro: input?.rubro === undefined ? base.rubro : input.rubro,
    tipo: input?.tipo === undefined ? base.tipo : input.tipo,
    estados: input?.estados === undefined ? base.estados : input.estados,
  };
  if (!isIsoDate(next.desde)) next.desde = base.desde;
  if (!isIsoDate(next.hasta)) next.hasta = base.hasta;
  if (next.tipo && !TIPOS.includes(next.tipo)) next.tipo = null;
  if (next.rubro === '') next.rubro = null;
  if (next.estados && next.estados.length === 0) next.estados = null;
  return next;
}

export function toRpcBody(filter: QueryFilter): Record<string, unknown> {
  return {
    p_desde: filter.desde,
    p_hasta: filter.hasta,
    p_rubro: filter.rubro,
    p_tipo: filter.tipo,
    p_estados: filter.estados,
  };
}

export function filterLabel(filter: QueryFilter): string {
  const fechas =
    filter.desde && filter.hasta ? `${filter.desde} – ${filter.hasta}` : 'todo el histórico';
  const rubro = filter.rubro ? `Rubro ${filter.rubro}` : 'Rubro: todos';
  return `${fechas} · ${rubro}`;
}
