import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ARR_MS, DAS_MS } from '../constants/game';
import { colors } from '../constants/theme';

type Props = {
  disabled?: boolean;
  onMove: (dx: number) => void;
  onRotate: () => void;
  onSoftDrop: (held: boolean) => void;
  onHardDrop: () => void;
};

export function Controls({ disabled, onMove, onRotate, onSoftDrop, onHardDrop }: Props) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dasRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopRepeat = () => {
    if (dasRef.current) clearTimeout(dasRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    dasRef.current = null;
    timerRef.current = null;
  };

  const startRepeat = (dx: number) => {
    stopRepeat();
    if (disabled) return;
    onMove(dx);
    dasRef.current = setTimeout(() => {
      timerRef.current = setInterval(() => onMove(dx), ARR_MS);
    }, DAS_MS);
  };

  return (
    <View style={styles.wrap} pointerEvents={disabled ? 'none' : 'auto'}>
      <View style={styles.row}>
        <Key
          label="←"
          onPressIn={() => startRepeat(-1)}
          onPressOut={stopRepeat}
        />
        <Key label="↻" onPress={onRotate} wide />
        <Key
          label="→"
          onPressIn={() => startRepeat(1)}
          onPressOut={stopRepeat}
        />
      </View>
      <View style={styles.row}>
        <Key
          label="Soft"
          onPressIn={() => onSoftDrop(true)}
          onPressOut={() => onSoftDrop(false)}
          wide
        />
        <Key label="Hard" onPress={onHardDrop} accent />
      </View>
    </View>
  );
}

function Key({
  label,
  onPress,
  onPressIn,
  onPressOut,
  wide,
  accent,
}: {
  label: string;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  wide?: boolean;
  accent?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={({ pressed }) => [
        styles.key,
        wide && styles.wide,
        accent && styles.accent,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.keyText, accent && styles.accentText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  key: {
    flex: 1,
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wide: {
    flex: 1.4,
  },
  accent: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  pressed: {
    opacity: 0.8,
  },
  keyText: {
    color: colors.neonText,
    fontSize: 18,
    fontWeight: '800',
  },
  accentText: {
    color: colors.void,
  },
});
