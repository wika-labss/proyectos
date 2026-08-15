import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';
import { Direction } from '../engine/snakeEngine';

type Props = {
  onDirection: (dir: Direction) => void;
  disabled?: boolean;
};

function PadButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        pressed && styles.btnPressed,
        disabled && styles.btnDisabled,
      ]}
    >
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
  );
}

export function DPad({ onDirection, disabled }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.spacer} />
        <PadButton label="▲" disabled={disabled} onPress={() => onDirection('up')} />
        <View style={styles.spacer} />
      </View>
      <View style={styles.row}>
        <PadButton label="◀" disabled={disabled} onPress={() => onDirection('left')} />
        <View style={styles.centerGap} />
        <PadButton label="▶" disabled={disabled} onPress={() => onDirection('right')} />
      </View>
      <View style={styles.row}>
        <View style={styles.spacer} />
        <PadButton label="▼" disabled={disabled} onPress={() => onDirection('down')} />
        <View style={styles.spacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spacer: {
    width: 64,
    height: 64,
  },
  centerGap: {
    width: 64,
    height: 64,
  },
  btn: {
    width: 64,
    height: 64,
    minWidth: 44,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.snake,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    backgroundColor: colors.grid,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    color: colors.hud,
    fontSize: 22,
    fontWeight: '700',
  },
});
