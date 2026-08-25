import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  AcdApiError,
  defaultFilter,
  fetchEstados,
  fetchLicitaciones,
  fetchResumen,
  fetchRubros,
  normalizeFilter,
  type EstadoRef,
  type LicitacionesPayload,
  type QueryFilter,
  type ResumenPayload,
  type RubroRef,
} from '../engine';
import { loadFilters, saveFilters } from '../modules/filters-store';

type ScreenState = 'loading' | 'success' | 'empty' | 'error';

type FiltersContextValue = {
  filter: QueryFilter;
  setFilter: (patch: Partial<QueryFilter>) => void;
  rubros: RubroRef[];
  estados: EstadoRef[];
  resumen: ResumenPayload | null;
  listado: LicitacionesPayload | null;
  status: ScreenState;
  error: string | null;
  refreshing: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
};

const FiltersContext = createContext<FiltersContextValue | null>(null);

export function FiltersProvider({ children }: { children: React.ReactNode }) {
  const [filter, setFilterState] = useState<QueryFilter>(defaultFilter());
  const [hydrated, setHydrated] = useState(false);
  const [rubros, setRubros] = useState<RubroRef[]>([]);
  const [estados, setEstados] = useState<EstadoRef[]>([]);
  const [resumen, setResumen] = useState<ResumenPayload | null>(null);
  const [listado, setListado] = useState<LicitacionesPayload | null>(null);
  const [status, setStatus] = useState<ScreenState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    void loadFilters().then((stored) => {
      setFilterState(stored);
      setHydrated(true);
    });
  }, []);

  const refresh = useCallback(async (next = filter) => {
    setRefreshing(true);
    setError(null);
    try {
      const [r, e, sum, list] = await Promise.all([
        fetchRubros(),
        fetchEstados(),
        fetchResumen(next),
        fetchLicitaciones(next, 30, 0),
      ]);
      setRubros(r);
      setEstados(e);
      setResumen(sum);
      setListado(list);
      const totalEstados = sum.por_estado.reduce((acc, row) => acc + row.n, 0);
      setStatus(totalEstados === 0 ? 'empty' : 'success');
    } catch (err) {
      const message = err instanceof AcdApiError ? err.message : 'No se pudo cargar el histórico.';
      setError(message);
      setStatus('error');
    } finally {
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    if (!hydrated) return;
    setStatus('loading');
    void refresh(filter);
  }, [hydrated, filter, refresh]);

  const setFilter = useCallback((patch: Partial<QueryFilter>) => {
    setFilterState((prev) => {
      const next = normalizeFilter({ ...prev, ...patch });
      void saveFilters(next);
      return next;
    });
  }, []);

  const loadMore = useCallback(async () => {
    if (!listado) return;
    if (listado.items.length >= listado.total) return;
    try {
      const more = await fetchLicitaciones(filter, 30, listado.items.length);
      setListado({
        ...more,
        items: [...listado.items, ...more.items],
      });
    } catch (err) {
      const message = err instanceof AcdApiError ? err.message : 'No se pudo cargar más.';
      setError(message);
    }
  }, [filter, listado]);

  const value = useMemo(
    () => ({
      filter,
      setFilter,
      rubros,
      estados,
      resumen,
      listado,
      status,
      error,
      refreshing,
      refresh: () => refresh(filter),
      loadMore,
    }),
    [filter, setFilter, rubros, estados, resumen, listado, status, error, refreshing, refresh, loadMore],
  );

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}

export function useFilters() {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error('useFilters debe usarse dentro de FiltersProvider');
  return ctx;
}
