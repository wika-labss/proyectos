import { router } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { colors, fonts, radius, spacing } from '../src/constants/theme';
import { useProgress } from '../src/hooks/ProgressProvider';

export default function InventoryScreen() {
  const { progress } = useProgress();

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>Inventario</Text>
      <Text style={styles.meta}>
        {progress.inventory.length} regalo
        {progress.inventory.length === 1 ? '' : 's'} en stock
        {' · '}
        {progress.rewardsGranted} ganados
      </Text>
      <Text style={styles.hint}>
        Entrega regalos a pretendientes. El arte de ítems llega en un pase
        posterior.
      </Text>

      {progress.inventory.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Sin recompensas aún</Text>
        </View>
      ) : (
        <FlatList
          data={progress.inventory}
          keyExtractor={(item, index) => `${item.id}-${item.grantedAt}-${index}`}
          contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemText}>{item.id}</Text>
            </View>
          )}
        />
      )}

      <PrimaryButton
        label="Volver"
        variant="ghost"
        onPress={() => router.back()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    fontFamily: fonts.brand,
    fontSize: 28,
    color: colors.textOnDark,
  },
  meta: {
    fontFamily: fonts.body,
    color: colors.muted,
    marginBottom: 8,
  },
  hint: {
    fontFamily: fonts.body,
    color: colors.muted,
    marginBottom: spacing.lg,
    fontSize: 13,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.muted,
    fontFamily: fonts.body,
  },
  item: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  itemText: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 16,
  },
});
