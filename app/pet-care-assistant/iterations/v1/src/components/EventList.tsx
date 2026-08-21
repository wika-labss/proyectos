import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { describeEvent, type CareEvent } from '../engine';
import { colors, fonts, spacing } from '../constants/theme';
import { StoolBadge } from './StoolBadge';

function timeLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function EventList({ events }: { events: CareEvent[] }) {
  if (events.length === 0) {
    return <Text style={styles.empty}>Sin registros este día</Text>;
  }
  return (
    <View style={styles.list}>
      {events.map((e) => (
        <View key={e.id} style={styles.row}>
          <Text style={styles.time}>{timeLabel(e.at)}</Text>
          <View style={styles.body}>
            <Text style={styles.desc}>{describeEvent(e)}</Text>
            {e.kind === 'bathroom' && e.payload.stool ? (
              <StoolBadge code={e.payload.stool} />
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

export function DatePager({
  dateKey,
  onPrev,
  onNext,
}: {
  dateKey: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <View style={styles.pager}>
      <Pressable onPress={onPrev} style={styles.pagerBtn} accessibilityRole="button">
        <Text style={styles.pagerText}>{'<'}</Text>
      </Pressable>
      <Text style={styles.pagerDate}>{dateKey}</Text>
      <Pressable onPress={onNext} style={styles.pagerBtn} accessibilityRole="button">
        <Text style={styles.pagerText}>{'>'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  time: {
    width: 52,
    color: colors.textMuted,
    fontSize: fonts.sizeSm,
    fontFamily: fonts.base,
  },
  body: { flex: 1, gap: spacing.xs },
  desc: {
    color: colors.text,
    fontSize: fonts.sizeMd,
    fontFamily: fonts.base,
  },
  empty: {
    color: colors.textMuted,
    fontSize: fonts.sizeMd,
    fontFamily: fonts.base,
    paddingVertical: spacing.lg,
  },
  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  pagerBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagerText: {
    color: colors.accent,
    fontSize: fonts.sizeLg,
    fontWeight: fonts.weightBold,
  },
  pagerDate: {
    color: colors.text,
    fontSize: fonts.sizeMd,
    fontWeight: fonts.weightBold,
    fontFamily: fonts.base,
  },
});
