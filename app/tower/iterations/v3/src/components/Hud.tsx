import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

type Props = {
  lives: number;
  gold: number;
  wave: number;
  waveCount: number;
  level: number;
  mapName: string;
  onPause: () => void;
};

export function Hud({
  lives,
  gold,
  wave,
  waveCount,
  level,
  mapName,
  onPause,
}: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.block}>
        <Text style={styles.label}>Vidas</Text>
        <Text style={[styles.value, lives <= 5 && styles.danger]}>{lives}</Text>
      </View>
      <View style={styles.block}>
        <Text style={styles.label}>Oro</Text>
        <Text style={[styles.value, { color: colors.gold }]}>{gold}</Text>
      </View>
      <View style={styles.block}>
        <Text style={styles.label}>Oleada</Text>
        <Text style={styles.value}>
          {wave === 0 ? 'Prep' : `${wave}/${waveCount}`}
        </Text>
      </View>
      <View style={styles.block}>
        <Text style={styles.label}>N{level}</Text>
        <Text style={styles.map} numberOfLines={1}>
          {mapName}
        </Text>
      </View>
      <Pressable onPress={onPause} style={styles.pause}>
        <Text style={styles.pauseText}>❚❚</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  block: {
    flex: 1,
  },
  label: {
    color: colors.muted,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  value: {
    color: colors.mist,
    fontSize: 18,
    fontWeight: '800',
  },
  danger: {
    color: colors.danger,
  },
  map: {
    color: colors.mist,
    fontSize: 12,
    fontWeight: '600',
  },
  pause: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.steel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseText: {
    color: colors.mist,
    fontSize: 14,
  },
});
