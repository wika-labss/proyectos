import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LOGICAL_H, LOGICAL_W } from '../constants/game';
import { getTowerType } from '../engine/towerTypes';
import { positionAt } from '../engine/pathSystem';
import type { TdState, TowerKind } from '../engine/types';

type Props = {
  run: TdState;
  selectedTower: TowerKind | null;
  width: number;
  height: number;
  onPadPress: (padId: string) => void;
};

const TOWER_TAG: Record<TowerKind, string> = {
  archer: 'Arq',
  cannon: 'Cañ',
  frost: 'Hie',
  sniper: 'Fra',
};

function TowerGlyph({ kind, size }: { kind: TowerKind; size: number }) {
  const def = getTowerType(kind);
  const tag = TOWER_TAG[kind];
  if (kind === 'archer') {
    return (
      <View style={[styles.glyphBase, { width: size, height: size }]}>
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: size * 0.35,
            borderRightWidth: size * 0.35,
            borderBottomWidth: size * 0.7,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: def.color,
          }}
        />
        <Text style={[styles.tag, { fontSize: size * 0.28 }]}>{tag}</Text>
      </View>
    );
  }
  if (kind === 'cannon') {
    return (
      <View style={[styles.glyphBase, { width: size, height: size }]}>
        <View
          style={{
            width: size * 0.7,
            height: size * 0.7,
            backgroundColor: def.color,
            borderRadius: 3,
            borderWidth: 2,
            borderColor: '#fff',
          }}
        />
        <Text style={[styles.tag, { fontSize: size * 0.28 }]}>{tag}</Text>
      </View>
    );
  }
  if (kind === 'frost') {
    return (
      <View style={[styles.glyphBase, { width: size, height: size }]}>
        <View
          style={{
            width: size * 0.72,
            height: size * 0.72,
            borderRadius: size * 0.36,
            backgroundColor: def.color,
            borderWidth: 2,
            borderColor: '#E0F7FA',
          }}
        />
        <Text style={[styles.tag, { fontSize: size * 0.28 }]}>{tag}</Text>
      </View>
    );
  }
  // sniper diamond
  return (
    <View style={[styles.glyphBase, { width: size, height: size }]}>
      <View
        style={{
          width: size * 0.55,
          height: size * 0.55,
          backgroundColor: def.color,
          borderWidth: 2,
          borderColor: '#fff',
          transform: [{ rotate: '45deg' }],
        }}
      />
      <Text style={[styles.tag, { fontSize: size * 0.28, marginTop: 2 }]}>
        {tag}
      </Text>
    </View>
  );
}

export function Battlefield({
  run,
  selectedTower,
  width,
  height,
  onPadPress,
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
      <View
        style={[
          styles.deco,
          {
            backgroundColor: run.map.palette.deco,
            bottom: height * 0.12,
            right: width * 0.08,
            width: 36,
            height: 36,
            opacity: 0.45,
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
        <View
          key={t.id}
          style={{
            position: 'absolute',
            left: t.pos.x * sx - 18,
            top: t.pos.y * sy - 22,
            zIndex: 5,
          }}
        >
          <TowerGlyph kind={t.kind} size={36} />
        </View>
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
        return (
          <View
            key={p.id}
            style={[
              styles.proj,
              {
                left: x * sx - 3,
                top: y * sy - 3,
                backgroundColor: getTowerType(p.kind).color,
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
  root: {
    overflow: 'hidden',
    borderRadius: 12,
  },
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
  glyphBase: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: {
    color: '#fff',
    fontWeight: '900',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginTop: 1,
  },
  enemy: {
    position: 'absolute',
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
    borderRadius: 8,
    borderWidth: 3,
    backgroundColor: '#0006',
  },
});
