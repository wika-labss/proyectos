import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  colors,
  fontWeight,
  spacing,
  typography,
} from '../src/design-system/tokens';
import { useGame } from '../src/hooks/GameProvider';
import {
  KeepBackdrop,
  OrnamentKicker,
  StoneButton,
} from '../src/modules/tower-ui-kit';

export default function HomeScreen() {
  const router = useRouter();
  const { campaign, campaignLoaded, refreshCampaign, startInfinite } =
    useGame();

  useEffect(() => {
    void refreshCampaign();
  }, [refreshCampaign]);

  return (
    <KeepBackdrop variant="menu">
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <Text style={styles.brand}>TOWER</Text>
          <Text style={styles.tagline}>Defiende la base.</Text>
        </View>

        <View style={styles.actions}>
          {campaignLoaded ? (
            <OrnamentKicker
              label={`Nivel ${campaign.maxUnlockedLevel}/25`}
            />
          ) : (
            <ActivityIndicator color={colors.ember} />
          )}
          <StoneButton
            label="Campaña"
            onPress={() => router.push('/levels')}
          />
          <StoneButton
            label="Modo Infinito"
            variant="secondary"
            onPress={() => {
              startInfinite();
              router.push('/game');
            }}
          />
          <StoneButton
            label="Tienda"
            variant="ghost"
            onPress={() => router.push('/shop')}
          />
          <StoneButton
            label="Cómo jugar"
            variant="ghost"
            onPress={() => router.push('/how-to')}
          />
        </View>
      </SafeAreaView>
    </KeepBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
    paddingBottom: spacing.xl,
  },
  hero: {
    marginTop: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  brand: {
    color: colors.mist,
    fontSize: typography.display,
    fontWeight: fontWeight.black,
    letterSpacing: 4,
    textAlign: 'center',
  },
  tagline: {
    color: colors.mist,
    fontSize: typography.body,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  actions: { gap: spacing.sm, paddingBottom: spacing.md },
});
