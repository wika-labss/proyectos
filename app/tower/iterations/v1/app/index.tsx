import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';
import { useGame } from '../src/hooks/GameProvider';

export default function HomeScreen() {
  const router = useRouter();
  const { campaign, campaignLoaded, refreshCampaign } = useGame();

  useEffect(() => {
    void refreshCampaign();
  }, [refreshCampaign]);

  return (
    <View style={styles.root}>
      <View style={styles.glow} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <Text style={styles.brand}>Tower</Text>
          <Text style={styles.tagline}>Defiende la base. Domina quince frentes.</Text>
        </View>

        <View style={styles.meta}>
          <Text style={styles.metaLabel}>Progreso</Text>
          {campaignLoaded ? (
            <Text style={styles.metaValue}>
              Nivel {campaign.maxUnlockedLevel}/15
              {campaign.campaignComplete ? ' · Campaña completa' : ''}
            </Text>
          ) : (
            <ActivityIndicator color={colors.ember} />
          )}
        </View>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
            onPress={() => router.push('/levels')}
          >
            <Text style={styles.ctaText}>
              {campaign.maxUnlockedLevel > 1 ? 'Continuar' : 'Jugar'}
            </Text>
          </Pressable>
          <Pressable
            style={styles.link}
            onPress={() => router.push('/how-to')}
          >
            <Text style={styles.linkText}>Cómo jugar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.night },
  glow: {
    position: 'absolute',
    top: -80,
    left: -40,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#E85D0433',
  },
  safe: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 36,
  },
  hero: { marginTop: 56, gap: 10 },
  brand: {
    color: colors.mist,
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  tagline: {
    color: colors.muted,
    fontSize: 17,
    fontWeight: '500',
    maxWidth: 280,
  },
  meta: { gap: 6 },
  metaLabel: {
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    fontSize: 12,
  },
  metaValue: {
    color: colors.gold,
    fontSize: 28,
    fontWeight: '800',
  },
  actions: { gap: 14 },
  cta: {
    backgroundColor: colors.ember,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  pressed: { opacity: 0.88 },
  ctaText: {
    color: colors.mist,
    fontSize: 20,
    fontWeight: '800',
  },
  link: { alignItems: 'center', paddingVertical: 8 },
  linkText: { color: colors.muted, fontSize: 15, fontWeight: '600' },
});
