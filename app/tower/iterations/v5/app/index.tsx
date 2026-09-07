import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../src/design-system/tokens';
import { useGame } from '../src/hooks/GameProvider';
import { KeepBackdrop, StoneButton } from '../src/modules/tower-ui-kit';

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
          <Text style={styles.brand}>Tower</Text>
          <Text style={styles.tagline}>Defiende la base. Fusiona. Sobrevive.</Text>
        </View>

        <View style={styles.meta}>
          <Text style={styles.metaLabel}>Progreso</Text>
          {campaignLoaded ? (
            <Text style={styles.metaValue}>
              Nivel {campaign.maxUnlockedLevel}/25
              {campaign.campaignComplete ? ' · Campaña completa' : ''}
            </Text>
          ) : (
            <ActivityIndicator color={colors.ember} />
          )}
        </View>

        <View style={styles.actions}>
          <StoneButton
            label={campaign.maxUnlockedLevel > 1 ? 'Continuar' : 'Campaña'}
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
  hero: { marginTop: spacing.xl, gap: spacing.sm },
  brand: {
    color: colors.mist,
    fontSize: typography.display,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  tagline: {
    color: colors.muted,
    fontSize: typography.body,
    fontWeight: '500',
    maxWidth: 280,
  },
  meta: { gap: spacing.xs },
  metaLabel: {
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    fontSize: typography.sm,
  },
  metaValue: {
    color: colors.torchGold,
    fontSize: 28,
    fontWeight: '800',
  },
  actions: { gap: spacing.sm },
});
