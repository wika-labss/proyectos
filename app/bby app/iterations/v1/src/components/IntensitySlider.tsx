import React, { useRef } from 'react';
import { LayoutChangeEvent, PanResponder, StyleSheet, Text, View } from 'react-native';
import { colors, layout, spacing, typography } from '../constants/theme';

interface IntensitySliderProps {
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export function IntensitySlider({ value, disabled = false, onChange }: IntensitySliderProps) {
  const trackWidth = useRef(0);

  const updateFromLocation = (locationX: number) => {
    if (disabled || trackWidth.current <= 0) {
      return;
    }

    const ratio = Math.max(0, Math.min(1, locationX / trackWidth.current));
    onChange(Math.round(ratio * 100));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: (event) => updateFromLocation(event.nativeEvent.locationX),
      onPanResponderMove: (event) => updateFromLocation(event.nativeEvent.locationX),
    }),
  ).current;

  const handleLayout = (event: LayoutChangeEvent) => {
    trackWidth.current = event.nativeEvent.layout.width;
  };

  const fillWidth = `${value}%` as `${number}%`;
  const thumbLeft = `${value}%` as `${number}%`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>INTENSIDAD</Text>
        <Text style={styles.value}>{value}%</Text>
      </View>
      <View
        style={[styles.track, disabled && styles.trackDisabled]}
        onLayout={handleLayout}
        {...panResponder.panHandlers}
      >
        <View style={[styles.fill, { width: fillWidth }]} />
        <View style={[styles.thumb, { left: thumbLeft }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  value: {
    ...typography.label,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  track: {
    height: layout.sliderHeight,
    borderRadius: layout.sliderHeight / 2,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    overflow: 'visible',
  },
  trackDisabled: {
    opacity: 0.45,
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    borderRadius: layout.sliderHeight / 2,
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    marginLeft: -12,
    borderRadius: 12,
    backgroundColor: colors.button,
    borderWidth: 2,
    borderColor: colors.primary,
    top: (layout.sliderHeight - 24) / 2,
  },
});
