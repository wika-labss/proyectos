import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { colors as splashColors } from '../src/constants/theme';

export default function SplashScreen() {
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fade, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          router.replace('/pairing');
        }
      });
    }, 1800);
    return () => clearTimeout(timer);
  }, [fade]);

  const goToPairing = () => {
    router.replace('/pairing');
  };

  return (
    <Pressable accessibilityRole="button" onPress={goToPairing} style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fade }]}>
        <Text accessibilityElementsHidden importantForAccessibility="no" style={styles.watermark}>
          Vissiuss
        </Text>
        <Text style={styles.title}>Vissiuss</Text>
        <Text style={styles.subtitle}>Control Remote</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: splashColors.splashBackground,
    flex: 1,
  },
  content: {
    alignItems: 'center',
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
