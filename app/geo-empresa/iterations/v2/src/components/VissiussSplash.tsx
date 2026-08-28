import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../constants/theme';

export function VissiussSplash() {
  const stretch = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(stretch, {
          toValue: 1.45,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(stretch, {
          toValue: 0.85,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => {
      animation.stop();
    };
  }, [stretch]);

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.brand,
          {
            transform: [{ scaleX: stretch }, { scaleY: 1.08 }],
          },
        ]}
      >
        vissiuss
      </Animated.Text>
      <Text style={styles.caption}>monitoreo activo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  brand: {
    color: colors.primary,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 4,
    textTransform: 'lowercase',
  },
  caption: {
    marginTop: spacing.md,
    color: colors.muted,
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
