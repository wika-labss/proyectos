import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ProgressBar } from '../src/components/ProgressBar';
import { Wordmark } from '../src/components/Wordmark';
import { colors, spacing, splashDurationMs } from '../src/constants/theme';
import { loadEvaluatorName } from '../src/modules/session';

export default function SplashScreen() {
  const router = useRouter();
  const progress = useRef(new Animated.Value(0)).current;
  const navigated = useRef(false);

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: splashDurationMs,
      easing: Easing.linear,
      useNativeDriver: false,
    });

    animation.start(({ finished }) => {
      if (!finished || navigated.current) return;
      navigated.current = true;
      void (async () => {
        const name = await loadEvaluatorName();
        router.replace(name ? '/home' : '/login');
      })();
    });

    return () => {
      animation.stop();
    };
  }, [progress, router]);

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
