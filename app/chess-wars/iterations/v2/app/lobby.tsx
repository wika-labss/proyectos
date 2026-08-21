import React from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { colors, radius, spacing, typography } from '../src/constants/theme';

export default function LobbyScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.pad}>
        <PrimaryButton label="← Home" variant="secondary" onPress={() => router.back()} />
        <Text style={styles.title}>Lobby</Text>
        <Text style={styles.sub}>Elige modo de partida</Text>

        <Pressable
          style={styles.card}
          onPress={() =>
            router.push({ pathname: '/prematch', params: { mode: 'classic' } })
          }
        >
          <Text style={styles.cardTitle}>Clásico</Text>
          <Text style={styles.cardBody}>Ajedrez FIDE puro. Sin nodos ni evoluciones.</Text>
        </Pressable>

        <Pressable
          style={[styles.card, styles.cardAccent]}
          onPress={() =>
            router.push({ pathname: '/prematch', params: { mode: 'evolutive' } })
          }
        >
          <Text style={styles.cardTitle}>Evolutive Quick</Text>
          <Text style={styles.cardBody}>
            Nodos de energía, XP, evoluciones y habilidades.
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  pad: { flex: 1, padding: spacing.lg, gap: spacing.md },
  title: { ...typography.title, color: colors.text, marginTop: spacing.md },
  sub: { ...typography.caption, color: colors.textMuted },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  cardAccent: { borderWidth: 1, borderColor: colors.accentSecondary },
  cardTitle: { ...typography.title, color: colors.accent, fontSize: 20 },
  cardBody: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm },
});
