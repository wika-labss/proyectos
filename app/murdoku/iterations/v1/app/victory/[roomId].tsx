import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { colors, fonts, spacing } from '../../src/constants/theme';
import { getRoom, ROOM_ORDER, type RoomId } from '../../src/engine';
import { useProgress } from '../../src/hooks/ProgressProvider';

export default function VictoryScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { progress } = useProgress();
  const id = roomId as RoomId;

  let title = 'Caso';
  try {
    title = getRoom(id).title;
  } catch {
    /* keep default */
  }

  const idx = ROOM_ORDER.indexOf(id);
  const next = idx >= 0 && idx < ROOM_ORDER.length - 1 ? ROOM_ORDER[idx + 1] : null;
  const nextUnlocked = next
    ? progress.campaign.unlocked.includes(next)
    : false;

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.body}>
        <Text style={styles.kicker}>Caso resuelto</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.blurb}>
          Las piezas encajan. La escena queda clarificada.
          {nextUnlocked
            ? ' Una nueva habitación espera.'
            : next
              ? ''
              : ' Has cerrado todas las habitaciones de la mansión.'}
        </Text>
      </View>
      <View style={styles.actions}>
        {nextUnlocked && next ? (
          <PrimaryButton
            label="Siguiente habitación"
            onPress={() => router.replace(`/case/${next}`)}
          />
        ) : null}
        <PrimaryButton
          label="Volver al mapa"
          variant={nextUnlocked ? 'ghost' : 'primary'}
          onPress={() => router.replace('/map')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  body: { marginTop: 64, gap: spacing.md },
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
  actions: { gap: spacing.sm, marginBottom: spacing.md },
});
