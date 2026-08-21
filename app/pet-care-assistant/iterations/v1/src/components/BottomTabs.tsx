import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { colors, fonts, spacing } from '../constants/theme';

const TABS = [
  { href: '/', label: 'Hoy' },
  { href: '/history', label: 'Histórico' },
  { href: '/pets', label: 'Ficha' },
] as const;

export function BottomTabs() {
  const pathname = usePathname();
  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const active =
          tab.href === '/'
            ? pathname === '/' || pathname === ''
            : pathname.startsWith(tab.href);
        return (
          <Link key={tab.href} href={tab.href} asChild>
            <Pressable style={styles.tab}>
              <Text style={[styles.label, active && styles.active]}>{tab.label}</Text>
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.textMuted,
    fontSize: fonts.sizeSm,
    fontFamily: fonts.base,
  },
  active: {
    color: colors.accent,
    fontWeight: fonts.weightBold,
  },
});
