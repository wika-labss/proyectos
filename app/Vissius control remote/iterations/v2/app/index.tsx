import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { colors as splashColors } from '../src/constants/theme';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/pairing');
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Pressable accessibilityRole="button" onPress={() => router.replace('/pairing')} style={styles.container}>
      <Text accessibilityElementsHidden importantForAccessibility="no" style={styles.watermark}>
        Vissiuss
      </Text>
      <Text style={styles.title}>Vissiuss</Text>
      <Text style={styles.subtitle}>Control Remote</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: splashColors.splashBackground,
    flex: 1,
    justifyContent: 'center',
  },
  watermark: {
    color: splashColors.splashText,
    fontSize: 120,
    fontWeight: '700',
    opacity: 0.12,
    position: 'absolute',
    textAlign: 'center',
  },
  title: {
    color: splashColors.splashText,
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: 1,
  },
  subtitle: {
    color: splashColors.splashText,
    fontSize: 16,
    fontWeight: '400',
    marginTop: 8,
    opacity: 0.85,
  },
});
