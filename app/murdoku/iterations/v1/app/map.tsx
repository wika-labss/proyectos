import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { colors, fonts, radius, spacing } from '../src/constants/theme';
import { ROOMS, isCompleted, isUnlocked } from '../src/engine';
import { useProgress } from '../src/hooks/ProgressProvider';

export default function MapScreen() {
  const { progress, ready } = useProgress();

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>Habitaciones de la mansión</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {ROOMS.map((room) => {
          const unlocked = isUnlocked(progress.campaign, room.id);
          const done = isCompleted(progress.campaign, room.id);
          return (
            <Pressable
              key={room.id}
              disabled={!unlocked}
              onPress={() => router.push(`/case/${room.id}`)}
              style={[
                styles.card,
                !unlocked && styles.locked,
                done && styles.done,
              ]}
            >
              <Text style={styles.cardTitle}>
                {unlocked ? room.title : `${room.title} (bloqueada)`}
              </Text>
              <Text style={styles.cardMeta}>
                {room.size}×{room.size}
                {done ? ' · Resuelto' : unlocked ? ' · Disponible' : ' · Bloqueado'}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <PrimaryButton
        label="Volver"
        variant="ghost"
        onPress={() => router.replace('/')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontFamily: fonts.brand,
    fontWeight: '700',
  },
  list: { gap: spacing.sm, paddingBottom: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 64,
    justifyContent: 'center',
  },
  locked: { opacity: 0.55 },
  done: { borderColor: colors.accent },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontFamily: fonts.body,
    fontWeight: '700',
  },
  cardMeta: {
    color: colors.textMuted,
    marginTop: 4,
    fontFamily: fonts.body,
  },
});
