import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { colors, fonts, skins, spacing } from '../../src/constants/theme';
import { getRoom, isUnlocked, type RoomId } from '../../src/engine';
import { useProgress } from '../../src/hooks/ProgressProvider';

export default function CaseIntroScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { progress } = useProgress();
  const id = roomId as RoomId;

  let room;
  try {
    room = getRoom(id);
  } catch {
    return (
      <View style={styles.center}>
        <Text style={styles.err}>Habitación desconocida</Text>
        <PrimaryButton label="Mapa" onPress={() => router.replace('/map')} />
      </View>
    );
  }

  if (!isUnlocked(progress.campaign, id)) {
    return (
      <View style={styles.center}>
        <Text style={styles.err}>Esta habitación aún está bloqueada.</Text>
        <PrimaryButton label="Mapa" onPress={() => router.replace('/map')} />
      </View>
    );
  }

  const skin = skins[room.skinKey];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: skin.background }]}>
      <View style={styles.body}>
        <Text style={styles.kicker}>Caso</Text>
        <Text style={styles.title}>{room.title}</Text>
        <Text style={styles.blurb}>{room.blurb}</Text>
        <Text style={styles.meta}>
          Tablero {room.size}×{room.size} · coloca víctima, sospechosos y asesino
        </Text>
      </View>
      <View style={styles.actions}>
        <PrimaryButton
          label="Investigar"
          onPress={() => router.push(`/play/${id}`)}
        />
        <PrimaryButton
          label="Volver al mapa"
          variant="ghost"
          onPress={() => router.back()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  body: { marginTop: 48, gap: spacing.md },
  kicker: {
    color: colors.accent,
    fontFamily: fonts.body,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  title: {
    color: colors.text,
    fontSize: 36,
    fontFamily: fonts.brand,
    fontWeight: '700',
  },
  blurb: {
    color: colors.textMuted,
    fontSize: 17,
    lineHeight: 26,
    fontFamily: fonts.body,
  },
  meta: {
    color: colors.text,
    fontFamily: fonts.body,
    marginTop: spacing.sm,
  },
  actions: { gap: spacing.sm, marginBottom: spacing.md },
  err: { color: colors.error, fontFamily: fonts.body, textAlign: 'center' },
});
