import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../src/modules/app-theme';
import { SodokuUiButton } from '../src/modules/sodoku-ui-kit';
import { useProgressStore } from '../src/stores/progressStore';

export default function HistoryScreen() {
  const history = useProgressStore((s) => s.history ?? []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.title}>Histórico local</Text>
      {history.length === 0 ? (
        <Text style={styles.empty}>Aún no hay victorias registradas.</Text>
      ) : (
        history.map((entry, index) => (
          <View key={`${entry.at}-${index}`} style={styles.row}>
            <Text style={styles.rowText}>Nivel {entry.levelId}</Text>
            <Text style={styles.rowText}>{entry.score} pts</Text>
            {entry.reward ? <Text style={styles.reward}>{entry.reward}</Text> : null}
            <Text style={styles.rowMeta}>{new Date(entry.at).toLocaleString()}</Text>
          </View>
        ))
      )}
      <SodokuUiButton
        label="Volver"
        variant="actionBarSecondary"
        onPress={() => router.back()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, gap: spacing.sm },
  title: {
    color: colors.accent,
    fontSize: typography.title,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  empty: { color: colors.text, fontSize: typography.body },
  row: {
    borderWidth: 2,
    borderColor: colors.secondary,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  rowText: { color: colors.text, fontSize: typography.body, fontWeight: '700' },
  reward: {
    color: colors.accent,
    fontSize: typography.small,
    fontWeight: '700',
    marginTop: 2,
  },
  rowMeta: { color: colors.textMuted, fontSize: typography.small, marginTop: 4 },
});
