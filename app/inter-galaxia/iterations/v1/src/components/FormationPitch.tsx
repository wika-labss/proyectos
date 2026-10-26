import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';
import type { FormationPreset, Player } from '../api/types';

interface Props {
  preset: FormationPreset;
  playersById: Record<string, Player>;
  assignments: { slotId: string; playerId?: string }[];
  onSlotPress?: (slotId: string) => void;
  editable?: boolean;
}

export function FormationPitch({
  preset,
  playersById,
  assignments,
  onSlotPress,
  editable = false,
}: Props) {
  const { width } = useWindowDimensions();
  const pitchWidth = Math.min(width - 32, 420);
  const pitchHeight = pitchWidth * 1.35;
  const assignmentMap = useMemo(() => {
    const map: Record<string, string | undefined> = {};
    assignments.forEach((a) => {
      map[a.slotId] = a.playerId;
    });
    return map;
  }, [assignments]);

  return (
    <View style={[styles.container, { width: pitchWidth }]}>
      <View style={[styles.pitch, { height: pitchHeight }]}>
        <Svg width={pitchWidth} height={pitchHeight} style={StyleSheet.absoluteFill}>
          <Rect x={0} y={0} width={pitchWidth} height={pitchHeight} fill="#2E7D32" />
          <Rect
            x={8}
            y={8}
            width={pitchWidth - 16}
            height={pitchHeight - 16}
            stroke="#A5D6A7"
            strokeWidth={2}
            fill="transparent"
          />
          <Line
            x1={8}
            y1={pitchHeight / 2}
            x2={pitchWidth - 8}
            y2={pitchHeight / 2}
            stroke="#A5D6A7"
            strokeWidth={2}
          />
        </Svg>
        {preset.slots.map((slot) => {
          const playerId = assignmentMap[slot.id];
          const player = playerId ? playersById[playerId] : undefined;
          const left = slot.x * pitchWidth - 28;
          const top = slot.y * pitchHeight - 28;
          const label = player
            ? `#${player.jerseyNumber ?? '–'} ${player.lastName.slice(0, 8)}`
            : slot.label;
          const content = (
            <View style={[styles.marker, player && styles.markerFilled]}>
              <Text style={styles.markerText} numberOfLines={1}>
                {label}
              </Text>
            </View>
          );
          if (editable && onSlotPress) {
            return (
              <Pressable
                key={slot.id}
                style={[styles.slot, { left, top }]}
                onPress={() => onSlotPress(slot.id)}
              >
                {content}
              </Pressable>
            );
          }
          return (
            <View key={slot.id} style={[styles.slot, { left, top }]}>
              {content}
            </View>
          );
        })}
      </View>
      <Text style={styles.caption}>{preset.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    marginVertical: 8,
  },
  pitch: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1B5E20',
  },
  slot: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    minWidth: 52,
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: '#E8F5E9',
    alignItems: 'center',
  },
  markerFilled: {
    backgroundColor: '#FFD54F',
    borderColor: '#FFC107',
  },
  markerText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1B1B1B',
    textAlign: 'center',
  },
  caption: {
    textAlign: 'center',
    marginTop: 6,
    color: '#33691E',
    fontWeight: '700',
  },
});
