import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { play } from '../constants/theme';
import { isBossAlive } from '../engine/boss';
import type { Boss } from '../engine/types';

type Props = {
  lives: number;
  score: number;
  level: number;
  boss?: Boss | null;
  statusLabel?: string;
};

export function Hud({ lives, score, level, boss, statusLabel }: Props) {
  const hearts = Array.from({ length: 3 }, (_, i) => (i < lives ? '♥' : '♡')).join(' ');
  const showBoss = isBossAlive(boss ?? null);
  return (
    <View>
      <View style={styles.row}>
        <Text style={styles.lives}>{hearts}</Text>
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.level}>Nv {level}</Text>
      </View>
      {showBoss && boss ? (
        <View style={styles.bossTrack}>
          <View
            style={[
              styles.bossFill,
              { width: `${Math.max(8, (boss.hitsLeft / boss.hitsMax) * 100)}%` },
            ]}
          />
        </View>
      ) : null}
      {statusLabel ? <Text style={styles.status}>{statusLabel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  lives: {
    color: '#E74C3C',
    fontSize: 18,
    letterSpacing: 1,
    fontWeight: '700',
    minWidth: 72,
  },
  score: {
    color: play.hud,
    fontSize: 20,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
  },
  level: {
    color: play.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  bossTrack: {
    height: 8,
    marginHorizontal: 16,
    marginBottom: 6,
    backgroundColor: '#3A1A28',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bossFill: {
    height: '100%',
    backgroundColor: play.boss,
    borderRadius: 4,
  },
  status: {
    paddingHorizontal: 16,
    color: play.hud,
    fontSize: 12,
    fontWeight: '600',
  },
});
