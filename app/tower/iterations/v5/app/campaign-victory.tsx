import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  colors,
  fontWeight,
  spacing,
} from '../src/design-system/tokens';
import {
  KeepBackdrop,
  OrnamentKicker,
  OrnamentSub,
  StoneButton,
} from '../src/modules/tower-ui-kit';

export default function CampaignVictoryScreen() {
  const router = useRouter();
  return (
    <KeepBackdrop variant="victory">
      <SafeAreaView style={styles.safe}>
        <View style={styles.cluster}>
          <OrnamentKicker label="Campaña" />
          <Text style={styles.title}>Victoria</Text>
          <OrnamentSub label="25 frentes seguros" />
          <Text style={styles.sub}>
            Los veinticinco frentes están seguros. La Última Muralla resiste.
          </Text>
          <StoneButton label="Menú" onPress={() => router.replace('/')} />
          <StoneButton
            label="Rejugar"
            variant="ghost"
            onPress={() => router.replace('/levels')}
          />
        </View>
      </SafeAreaView>
    </KeepBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: spacing.lg },
  cluster: {
    marginTop: 'auto',
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  title: {
    color: colors.mist,
    fontSize: 48,
    fontWeight: fontWeight.black,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  sub: {
    color: colors.muted,
    textAlign: 'center',
  },
});
