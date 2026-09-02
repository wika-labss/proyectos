import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../design-system';

export function CoinMark({ size = 22 }: { size?: number }) {
  return (
    <View
      style={[
        styles.coin,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Text style={[styles.c, { fontSize: Math.max(8, size * 0.42) }]}>C</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  coin: {
    backgroundColor: colors.coin,
    borderWidth: 2,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  c: {
    color: colors.star,
    fontFamily: fonts.pixel,
    fontWeight: '700',
  },
});
