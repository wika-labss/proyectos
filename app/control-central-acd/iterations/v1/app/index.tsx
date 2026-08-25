import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../src/components/Screen';
import { FilterBar } from '../src/components/FilterBar';
import { BarChart } from '../src/components/BarChart';
import { appTitle, colors, fonts, spacing } from '../src/constants/theme';
import { useFilters } from '../src/hooks/FiltersProvider';
import { useNetworkStatus } from '../src/hooks/useNetworkStatus';
import { filterLabel } from '../src/engine/filters';
import { isEmptyResumen, toDiaBars, toEstadoBars, toRubroBars } from '../src/engine/resumen';

export default function TableroScreen() {
  const router = useRouter();
  const { filter, setFilter, rubros, estados, resumen, status, error } = useFilters();
  const { online } = useNetworkStatus();

  return (
    <Screen title={appTitle} subtitle={filterLabel(filter)}>
      <ScrollView contentContainerStyle={styles.content}>
        {!online ? <Text style={styles.warn}>Sin red. Se mostrará el último intento al reconectar.</Text> : null}
        {status === 'error' ? <Text style={styles.warn}>{error}</Text> : null}
        {status === 'loading' ? <Text style={styles.meta}>Cargando resumen…</Text> : null}
        <FilterBar filter={filter} rubros={rubros} estados={estados} onChange={setFilter} />
        {status === 'empty' || isEmptyResumen(resumen) ? (
          <Text style={styles.meta}>No hay licitaciones para este filtro.</Text>
        ) : null}
        {resumen ? (
          <>
            <BarChart
              title="Por estado"
              bars={toEstadoBars(resumen.por_estado)}
              onPressBar={(bar) => {
                if (typeof bar.codigo === 'number') {
                  setFilter({ estados: [bar.codigo] });
                  router.push('/licitaciones');
                }
              }}
            />
            <BarChart
              title="Por rubro"
              bars={toRubroBars(resumen.por_rubro)}
              onPressBar={(bar) => {
                if (typeof bar.codigo === 'string') {
                  setFilter({ rubro: bar.codigo });
                  router.push('/licitaciones');
                }
              }}
            />
            <BarChart title="Volumen por día" bars={toDiaBars(resumen.por_dia)} />
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xl,
  },
  warn: {
    color: colors.error,
    fontSize: fonts.caption,
    marginBottom: spacing.sm,
  },
  meta: {
    color: colors.textMuted,
    fontSize: fonts.caption,
    marginBottom: spacing.md,
  },
});
