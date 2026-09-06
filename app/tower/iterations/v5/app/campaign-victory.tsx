import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../src/design-system/tokens';
import { KeepBackdrop, StoneButton } from '../src/modules/tower-ui-kit';

export default function CampaignVictoryScreen() {
  const router = useRouter();
  return (
    <KeepBackdrop variant="victory">
      <SafeAreaView style={styles.safe}>
        <Text style={styles.kicker}>Campaña</Text>
        <Text style={styles.title}>Victoria</Text>
        <Text style={styles.sub}>
          Los veinticinco frentes están seguros. La Última Muralla resiste.
        </Text>
        <StoneButton label="Menú" onPress={() => router.replace('/')} />
        <StoneButton
          label="Rejugar niveles"
          variant="ghost"
          onPress={() => router.replace('/levels')}
        />
      </SafeAreaView>
    </KeepBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    gap: spacing.md,
  },
  kicker: {
    color: colors.torchGold,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  title: {
    color: colors.mist,
    fontSize: 48,
    fontWeight: '900',
  },
  sub: {
    color: colors.muted,
    fontSize: typography.body,
    marginBottom: spacing.md,
  },
});
