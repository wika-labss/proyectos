import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FONT_FAMILY } from '../types';

interface SevenSegmentDisplayProps {
  value: string;
  color: string;
  glowColor: string;
  size?: 'large' | 'medium' | 'small';
  ampm?: string | null;
}

const SIZE_MAP = {
  large: 72,
  medium: 48,
  small: 32,
} as const;

export function SevenSegmentDisplay({
  value,
  color,
  glowColor,
  size = 'large',
  ampm = null,
}: SevenSegmentDisplayProps) {
  const [colonVisible, setColonVisible] = useState(true);
  const fontSize = SIZE_MAP[size];

  useEffect(() => {
    const id = setInterval(() => setColonVisible((visible) => !visible), 500);
    return () => clearInterval(id);
  }, []);

  const rendered = useMemo(() => {
    return value.split('').map((char, index) => {
      if (char === ':') {
        return (
          <Text
            key={`${char}-${index}`}
            style={[
              styles.digit,
              {
                color,
                fontSize,
                opacity: colonVisible ? 1 : 0.3,
                textShadowColor: glowColor,
              },
            ]}
          >
            :
          </Text>
        );
      }
      return (
        <Text
          key={`${char}-${index}`}
          style={[
            styles.digit,
            {
              color,
              fontSize,
              textShadowColor: glowColor,
            },
          ]}
        >
          {char}
        </Text>
      );
    });
  }, [colonVisible, color, fontSize, glowColor, value]);

  return (
    <View style={styles.row}>
      {rendered}
      {ampm ? (
        <Text style={[styles.ampm, { color, textShadowColor: glowColor }]}>{ampm}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: {
    fontFamily: FONT_FAMILY,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    includeFontPadding: false,
  },
  ampm: {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    marginLeft: 8,
    marginTop: 16,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
