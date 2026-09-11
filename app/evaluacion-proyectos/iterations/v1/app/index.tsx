import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ProgressBar } from '../src/components/ProgressBar';
import { Wordmark } from '../src/components/Wordmark';
import { colors, spacing } from '../src/constants/theme';
import { loadEvaluatorName } from '../src/modules/session';

const SPLASH_MS = 5000;

export default function SplashScreen() {
  const router = useRouter();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;
    progress.setValue(0);
    const startedAt = Date.now();
    const barId = setInterval(() => {
      progress.setValue(Math.min(1, (Date.now() - startedAt) / SPLASH_MS));
    }, 50);
    const navId = setTimeout(() => {
      if (cancelled) return;
      void (async () => {
        const name = await loadEvaluatorName();
        if (cancelled) return;
        router.replace(name ? '/home' : '/login');
      })();
    }, SPLASH_MS);
    return () => {
      cancelled = true;
      clearInterval(barId);
      clearTimeout(navId);
    };
    // Clock-based 5s splash; router is read at timeout fire.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.root}>
      <Wordmark />
      <View style={styles.barWrap}>
        <ProgressBar progress={width} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  barWrap: {
    marginTop: spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
});
