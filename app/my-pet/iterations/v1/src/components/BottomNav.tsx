import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { colors, fonts, spacing } from '../constants/theme';

const TABS = [
  { href: '/', label: 'Mascotas' },
  { href: '/alerts', label: 'Alertas' },
  { href: '/settings', label: 'Ajustes' },
] as const;

export function BottomNav({ unseen = 0 }: { unseen?: number }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
        const badge = tab.href === '/alerts' && unseen > 0;
        return (
          <Pressable
            key={tab.href}
            onPress={() => router.push(tab.href as '/')}
            style={styles.tab}
            accessibilityRole="button"
          >
            <Text style={[styles.label, active && styles.active]}>
              {tab.label}
              {badge ? ` (${unseen})` : ''}
            </Text>
          </Pressable>
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
    paddingVertical: spacing.sm,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.textMuted,
    fontFamily: fonts.base,
    fontSize: fonts.sizeSm,
  },
  active: {
    color: colors.accent,
    fontWeight: fonts.weightBold,
  },
});
