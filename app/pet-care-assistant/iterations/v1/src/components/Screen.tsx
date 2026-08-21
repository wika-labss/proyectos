import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '../constants/theme';
import { BottomTabs } from './BottomTabs';

export function Screen({
  children,
  title,
  subtitle,
  showTabs = true,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showTabs?: boolean;
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.body}>{children}</View>
      </ScrollView>
      {showTabs ? <BottomTabs /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: fonts.sizeLg,
    fontWeight: fonts.weightBold,
    fontFamily: fonts.base,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fonts.sizeMd,
    fontFamily: fonts.base,
    marginBottom: spacing.sm,
  },
  body: { gap: spacing.md },
});
