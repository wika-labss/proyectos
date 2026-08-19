import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { TOTAL_LEVELS } from '../src/constants/levels';
import { spacing } from '../src/modules/app-theme';
import { SodokuInfoChip, SodokuUiButton } from '../src/modules/sodoku-ui-kit';
import { BrandHeader, CuteScreenBackground } from '../src/modules/sodoku-visual';
import { useProgressStore } from '../src/stores/progressStore';

/** Home V3.5 — visual-expectation + pack ui-v5 (99%) */
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
    <CuteScreenBackground variant="home">
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.hero,
            { opacity: brandOpacity, transform: [{ translateY: brandY }] },
          ]}
        >
          <BrandHeader
            showBanner
            badge="v3.5 · ui-v5 99%"
            subtitle={`Nivel ${continueLevelId} · ${completedCount}/${TOTAL_LEVELS}`}
          />
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
    </CuteScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  hero: { alignItems: 'center', width: '100%' },
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
