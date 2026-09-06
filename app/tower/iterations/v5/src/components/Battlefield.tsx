import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LOGICAL_H, LOGICAL_W } from '../constants/game';
import {
  colors,
  radius,
  towerTint,
  typography,
} from '../design-system/tokens';
import { getTowerDisplayName } from '../engine/towerTypes';
import { positionAt } from '../engine/pathSystem';
import type { EnemyKind, TdState, TowerKind, TowerTier } from '../engine/types';
import { enemySprites, towerSprites } from '../modules/tower-ui-kit';

type Props = {
  run: TdState;
  selectedTower: TowerKind | null;
  selectedPlacedId: string | null;
  width: number;
  height: number;
  onPadPress: (padId: string) => void;
  onTowerPress: (towerId: string) => void;
};

function TowerSprite({
  kind,
  tier,
  size,
  selected,
}: {
  kind: TowerKind;
  tier: TowerTier;
  size: number;
  selected: boolean;
}) {
  const label =
    tier === 4 ? getTowerDisplayName(kind, tier) : `Lv.${tier}`;
  return (
    <View style={[styles.glyphBase, selected && styles.glyphSelected]}>
      <Image
        source={towerSprites[kind]}
        style={{ width: size, height: size }}
      />
      <Text
        style={[
          styles.tag,
          { color: tier === 4 ? colors.torchGold : colors.mist },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

export function Battlefield({
  run,
  selectedTower,
  selectedPlacedId,
  width,
  height,
  onPadPress,
  onTowerPress,
}: Props) {
  const sx = width / LOGICAL_W;
  const sy = height / LOGICAL_H;

  const pathSegments = useMemo(() => {
    const pts = run.map.path;
    const segs = [];
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1]!;
      const b = pts[i]!;
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      segs.push({ mx, my, len, angle });
    }
    return segs;
  }, [run.map.path]);

  return (
    <View
      style={[
        styles.root,
        { width, height, backgroundColor: colors.keepVoid },
      ]}
    >
      <View
        style={[
          styles.deco,
          {
            backgroundColor: colors.stone,
            top: height * 0.08,
            left: width * 0.05,
          },
        ]}
      />

      {pathSegments.map((seg, i) => (
        <View
          key={`seg-${i}`}
          style={{
            position: 'absolute',
            left: seg.mx * sx - (seg.len * sx) / 2,
            top: seg.my * sy - 7,
            width: seg.len * sx,
            height: 14,
            backgroundColor: colors.pathOchre,
            borderRadius: 7,
            transform: [{ rotate: `${seg.angle}deg` }],
            opacity: 0.95,
          }}
        />
      ))}

      {run.map.pads.map((pad) => {
        const occupied = run.occupiedPads.has(pad.id);
        const hot = !!selectedTower && !occupied;
        return (
          <Pressable
            key={pad.id}
            onPress={() => onPadPress(pad.id)}
            style={[
              styles.pad,
              {
                left: pad.x * sx - 14,
                top: pad.y * sy - 14,
                backgroundColor: hot
                  ? colors.padHot
                  : occupied
                    ? colors.overlay
                    : colors.stoneHi,
                borderColor: hot ? colors.torchGold : colors.stone,
              },
            ]}
          />
        );
      })}

      {run.towers.map((t) => (
        <Pressable
          key={t.id}
          onPress={() => onTowerPress(t.id)}
          style={{
            position: 'absolute',
            left: t.pos.x * sx - 22,
            top: t.pos.y * sy - 26,
            zIndex: 5,
          }}
        >
          <TowerSprite
            kind={t.kind}
            tier={t.tier}
            size={36}
            selected={selectedPlacedId === t.id}
          />
        </Pressable>
      ))}

      {run.enemies.map((e) => {
        const pos = positionAt(run.map.path, e.pathT);
        const r = Math.max(10, e.radius * sx * 0.7);
        const kind = e.kind as EnemyKind;
        return (
          <Image
            key={e.id}
            source={enemySprites[kind]}
            style={{
              position: 'absolute',
              left: pos.x * sx - r,
              top: pos.y * sy - r,
              width: r * 2,
              height: r * 2,
            }}
          />
        );
      })}

      {run.projectiles.map((p) => {
        const life = Math.min(1, (run.nowMs - p.bornAt) / p.ttlMs);
        const x = p.from.x + (p.to.x - p.from.x) * life;
        const y = p.from.y + (p.to.y - p.from.y) * life;
        return (
          <View
            key={p.id}
            style={[
              styles.proj,
              {
                left: x * sx - 3,
                top: y * sy - 3,
                backgroundColor: towerTint[p.kind],
              },
            ]}
          />
        );
      })}

      {(() => {
        const end = run.map.path[run.map.path.length - 1]!;
        return (
          <View
            style={[
              styles.base,
              {
                left: end.x * sx - 16,
                top: end.y * sy - 16,
              },
            ]}
          />
        );
      })()}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { overflow: 'hidden', borderRadius: radius.md },
  deco: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    opacity: 0.35,
  },
  pad: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    borderWidth: 2,
  },
  glyphBase: { alignItems: 'center', justifyContent: 'center' },
  glyphSelected: {
    borderWidth: 2,
    borderColor: colors.torchGold,
    borderRadius: radius.sm,
    padding: 2,
    backgroundColor: colors.overlay,
  },
  tag: {
    fontWeight: '900',
    fontSize: typography.xs,
    marginTop: 2,
  },
  proj: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  base: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    borderWidth: 3,
    borderColor: colors.ember,
    backgroundColor: colors.overlay,
  },
});
