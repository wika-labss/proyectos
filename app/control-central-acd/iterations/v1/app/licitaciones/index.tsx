import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { Screen } from '../../src/components/Screen';
import { LicitacionCardView } from '../../src/components/LicitacionCard';
import { colors, fonts, spacing, touchMin } from '../../src/constants/theme';
import { useFilters } from '../../src/hooks/FiltersProvider';
import { filterLabel } from '../../src/engine/filters';

export default function ListadoScreen() {
  const router = useRouter();
  const { filter, listado, status, error, loadMore } = useFilters();

  return (
    <Screen title="Licitaciones" subtitle={filterLabel(filter)}>
      {status === 'error' ? <Text style={styles.warn}>{error}</Text> : null}
      <FlatList
        data={listado?.items ?? []}
        keyExtractor={(item) => item.codigo}
        renderItem={({ item }) => (
          <LicitacionCardView
            item={item}
            onOpen={() => router.push(`/licitaciones/${item.codigo}`)}
            onPerfil={() => router.push(`/licitaciones/${item.codigo}/ganador`)}
            onFicha={() => void Linking.openURL(item.url_ficha)}
          />
        )}
        ListEmptyComponent={
          status === 'loading' ? (
            <Text style={styles.meta}>Cargando listado…</Text>
          ) : (
            <Text style={styles.meta}>No hay licitaciones para este filtro.</Text>
          )
        }
        ListFooterComponent={
          listado && listado.items.length < listado.total ? (
            <Pressable onPress={() => void loadMore()} style={styles.more} accessibilityRole="button">
              <Text style={styles.moreLabel}>
                Cargar más ({listado.items.length} / {listado.total})
              </Text>
            </Pressable>
          ) : (
            <View style={{ height: spacing.lg }} />
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  warn: {
    color: colors.error,
    marginBottom: spacing.sm,
    fontSize: fonts.caption,
  },
  meta: {
    color: colors.textMuted,
    fontSize: fonts.caption,
  },
  more: {
    minHeight: touchMin,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  moreLabel: {
    color: colors.accent,
    fontWeight: '800',
  },
});
