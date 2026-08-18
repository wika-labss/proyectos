import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { REWARD_NAMES } from '../src/types';
import { countGifts, countGiftsByName, listGifts } from '../src/modules/inventory';
import { colors, spacing, typography } from '../src/modules/app-theme';
import { SodokuUiButton } from '../src/modules/sodoku-ui-kit';
import { useProgressStore } from '../src/stores/progressStore';

export default function InventoryScreen() {
  const inventory = useProgressStore((s) => s.inventory ?? []);
  const gifts = useMemo(() => listGifts(inventory), [inventory]);
  const total = countGifts(gifts);
  const byName = useMemo(() => countGiftsByName(gifts), [gifts]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.title}>Inventario</Text>
      <Text style={styles.subtitle}>{total} regalos disponibles</Text>

      {total === 0 ? (
        <Text style={styles.empty}>Aún no tienes regalos. Completa un nivel para ganar uno.</Text>
      ) : (
        <View style={styles.list}>
          {REWARD_NAMES.map((name) => {
            const qty = byName[name];
            if (qty <= 0) return null;
            return (
              <View key={name} style={styles.row}>
                <Text style={styles.giftName}>{name}</Text>
                <Text style={styles.giftQty}>×{qty}</Text>
              </View>
            );
          })}
        </View>
      )}

      <SodokuUiButton label="Inicio" variant="ctaCompact" onPress={() => router.replace('/')} />
      <View style={{ height: 8 }} />
      <SodokuUiButton label="Jugar" variant="ctaFull" onPress={() => router.push('/levels')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.sm },
  title: { color: colors.accent, fontSize: typography.title, fontWeight: '800' },
  subtitle: {
    color: colors.active,
    fontSize: typography.subtitle,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  empty: { color: colors.text, fontSize: typography.body, marginBottom: spacing.lg },
  list: { gap: spacing.sm, marginBottom: spacing.lg },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.secondary,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  giftName: { color: colors.text, fontSize: typography.body, fontWeight: '700' },
  giftQty: { color: colors.accent, fontSize: typography.body, fontWeight: '800' },
});
