import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LOGICAL_H, LOGICAL_W } from '../constants/game';
import { getTowerCombatStats, getTowerDisplayName } from '../engine/towerTypes';
import { positionAt } from '../engine/pathSystem';
import type { TdState, TowerKind, TowerTier } from '../engine/types';

type Props = {
  run: TdState;
  selectedTower: TowerKind | null;
  selectedPlacedId: string | null;
  width: number;
  height: number;
  onPadPress: (padId: string) => void;
  onTowerPress: (towerId: string) => void;
};

function TowerGlyph({
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
  const def = getTowerCombatStats(kind, tier);
  const label =
    tier === 4 ? getTowerDisplayName(kind, tier) : `Lv.${tier}`;
  const short =
    tier === 4
      ? label.length > 10
        ? label.slice(0, 9) + '…'
        : label
      : label;

  const shape =
    kind === 'archer' ? (
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: size * 0.32,
          borderRightWidth: size * 0.32,
          borderBottomWidth: size * 0.62,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: def.color,
        }}
      />
    ) : kind === 'cannon' ? (
      <View
        style={{
          width: size * 0.65,
          height: size * 0.65,
          backgroundColor: def.color,
          borderRadius: 3,
          borderWidth: 2,
          borderColor: '#fff',
        }}
      />
    ) : kind === 'frost' ? (
      <View
        style={{
          width: size * 0.68,
          height: size * 0.68,
          borderRadius: size * 0.34,
          backgroundColor: def.color,
          borderWidth: 2,
          borderColor: '#E0F7FA',
        }}
      />
    ) : (
      <View
        style={{
          width: size * 0.5,
          height: size * 0.5,
          backgroundColor: def.color,
          borderWidth: 2,
          borderColor: '#fff',
          transform: [{ rotate: '45deg' }],
        }}
      />
    );

  return (
    <View
      style={[
        styles.glyphBase,
        { width: size + 8, minHeight: size + 14 },
        selected && styles.glyphSelected,
      ]}
    >
      {shape}
      <Text
        style={[
          styles.tag,
          { fontSize: tier === 4 ? 8 : 10, color: tier === 4 ? '#FFD60A' : '#fff' },
        ]}
        numberOfLines={1}
      >
        {short}
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
        { width, height, backgroundColor: run.map.palette.bg },
      ]}
    >
      <View
        style={[
          styles.deco,
          {
            backgroundColor: run.map.palette.deco,
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
            backgroundColor: run.map.palette.path,
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
                  ? run.map.palette.accent
                  : occupied
                    ? '#00000066'
                    : '#ffffff28',
                borderColor: hot ? '#fff' : run.map.palette.accent,
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
          <TowerGlyph
            kind={t.kind}
            tier={t.tier}
            size={36}
            selected={selectedPlacedId === t.id}
          />
        </Pressable>
      ))}

      {run.enemies.map((e) => {
        const pos = positionAt(run.map.path, e.pathT);
        const r = Math.max(6, e.radius * sx * 0.55);
        return (
          <View
            key={e.id}
            style={[
              styles.enemy,
              {
                left: pos.x * sx - r,
                top: pos.y * sy - r,
                width: r * 2,
                height: r * 2,
                borderRadius: r,
                backgroundColor: e.color,
              },
            ]}
          />
        );
      })}

      {run.projectiles.map((p) => {
        const life = Math.min(1, (run.nowMs - p.bornAt) / p.ttlMs);
        const x = p.from.x + (p.to.x - p.from.x) * life;
        const y = p.from.y + (p.to.y - p.from.y) * life;
        const color = getTowerCombatStats(p.kind, 1).color;
        return (
          <View
            key={p.id}
            style={[
              styles.proj,
              {
                left: x * sx - 3,
                top: y * sy - 3,
                backgroundColor: color,
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
                borderColor: run.map.palette.accent,
              },
            ]}
          />
        );
      })()}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { overflow: 'hidden', borderRadius: 12 },
  deco: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 8,
    opacity: 0.35,
  },
  pad: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
  },
  glyphBase: { alignItems: 'center', justifyContent: 'center' },
  glyphSelected: {
    borderWidth: 2,
    borderColor: '#FFD60A',
    borderRadius: 8,
    padding: 2,
    backgroundColor: '#00000055',
  },
  tag: {
    fontWeight: '900',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginTop: 2,
  },
  enemy: { position: 'absolute' },
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
    borderRadius: 8,
    borderWidth: 3,
    backgroundColor: '#0006',
  },
});
