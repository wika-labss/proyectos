import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { bit, chrome, motion } from '../../design-system/tokens';
import { PixelText } from '../../components/pixel/PixelText';

export type RailItemId = 'play' | 'how' | 'avatar';

type Props = {
  id: RailItemId;
  icon: string;
  label: string;
  expanded: boolean;
  onPress: () => void;
};

export function RailButton({ icon, label, expanded, onPress }: Props) {
  const progress = useRef(new Animated.Value(expanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: expanded ? 1 : 0,
      duration: motion.railExpandMs,
      useNativeDriver: false,
    }).start();
  }, [expanded, progress]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [chrome.railCollapsed, chrome.railExpanded],
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <Animated.View
        style={[
          styles.box,
          expanded ? styles.boxOpen : styles.boxIdle,
          { width, minHeight: chrome.hit },
        ]}
      >
        <View style={styles.iconSlot}>
          <PixelText size="sm" color={expanded ? bit.pink : bit.muted}>
            {icon}
          </PixelText>
        </View>
        <Animated.View style={[styles.labelSlot, { opacity: progress }]}>
          <PixelText size="xs" color={bit.ink} numberOfLines={1}>
            {label}
          </PixelText>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    overflow: 'hidden',
    backgroundColor: bit.panel,
    borderWidth: chrome.outline,
    paddingHorizontal: 8,
    gap: 8,
  },
  boxIdle: {
    borderColor: bit.muted,
  },
  boxOpen: {
    borderColor: bit.pink,
  },
  iconSlot: {
    width: 28,
    alignItems: 'center',
  },
  labelSlot: {
    flex: 1,
  },
  pressed: {
    opacity: motion.pressOpacity,
  },
});
