import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TOTAL_LEVELS } from '../src/constants/levels';
import { colors, spacing, typography } from '../src/modules/app-theme';
import { SodokuInfoChip, SodokuUiButton } from '../src/modules/sodoku-ui-kit';
import { useProgressStore } from '../src/stores/progressStore';

const BG = require('../assets/recursos/bg_002_cute_pink.png');

/** home-branding V3.2 — pack recursos sodoku */
export default function HomeScreen() {
  const totalScore = useProgressStore((s) => s.totalScore);
  const giftsCount = useProgressStore((s) => s.giftsCount());
  const continueLevelId = useProgressStore((s) => s.continueLevelId());
  const historyCount = useProgressStore((s) => (s.history ?? []).length);
  const completedCount = useProgressStore((s) => s.completedCount());

  const brandOpacity = useRef(new Animated.Value(0)).current;
  const brandY = useRef(new Animated.Value(16)).current;
  const actionsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(brandOpacity, { toValue: 1, duration: 520, useNativeDriver: true }),
        Animated.timing(brandY, { toValue: 0, duration: 520, useNativeDriver: true }),
      ]),
      Animated.timing(actionsOpacity, { toValue: 1, duration: 420, useNativeDriver: true }),
    ]).start();
  }, [brandOpacity, brandY, actionsOpacity]);

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={styles.scrim} />
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.hero,
            { opacity: brandOpacity, transform: [{ translateY: brandY }] },
          ]}
        >
          <Text style={styles.brand}>VISSIUSS</Text>
          <Text style={styles.title}>Sodoku nuevo</Text>
          <Text style={styles.badge}>v3.2 · recursos sodoku</Text>
          <Text style={styles.subtitle}>
            Nivel {continueLevelId} · {completedCount}/{TOTAL_LEVELS}
          </Text>
        </Animated.View>

        <Animated.View style={[styles.actions, { opacity: actionsOpacity }]}>
          <SodokuUiButton
            label="Jugar"
            variant="ctaFull"
            onPress={() => router.push(`/game/${continueLevelId}`)}
          />
          <SodokuUiButton
            label="Inventario"
            variant="ctaCompact"
            onPress={() => router.push('/inventory')}
          />
        </Animated.View>

        <Animated.View style={[styles.infoRow, { opacity: actionsOpacity }]}>
          <SodokuInfoChip
            kind="puntaje"
            label="Puntaje"
            value={totalScore}
            onPress={() => router.push('/score')}
          />
          <SodokuInfoChip
            kind="historico"
            label="Histórico"
            value={historyCount}
            onPress={() => router.push('/history')}
          />
          <SodokuInfoChip
            kind="regalos"
            label="Regalos"
            value={giftsCount}
            onPress={() => router.push('/inventory')}
          />
        </Animated.View>

        <Animated.View style={{ opacity: actionsOpacity, width: '100%', maxWidth: 280 }}>
          <SodokuUiButton
            label="Ver todos los niveles"
            variant="pillLink"
            onPress={() => router.push('/levels')}
          />
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: '100%', height: '100%' },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.scrim,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  hero: { alignItems: 'center', marginBottom: spacing.lg },
  brand: {
    color: colors.white,
    fontSize: 28,
    letterSpacing: 8,
    fontWeight: '900',
    textShadowColor: 'rgba(90,42,58,0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.white,
    fontSize: typography.title,
    fontWeight: '800',
    textShadowColor: 'rgba(90,42,58,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  badge: {
    marginTop: spacing.sm,
    color: colors.text,
    backgroundColor: colors.infoBg,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: typography.small,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: spacing.sm,
    color: colors.text,
    fontSize: typography.small,
    fontWeight: '600',
    backgroundColor: colors.infoBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  actions: {
    width: '100%',
    maxWidth: 340,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.lg,
  },
});
