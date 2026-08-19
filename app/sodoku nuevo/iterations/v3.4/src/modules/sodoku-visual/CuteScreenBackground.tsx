import React from 'react';
import { Image, ImageBackground, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../../design-system';
import { VisualAssets } from './assets';

interface Props {
  children: React.ReactNode;
  variant: 'home' | 'game';
  style?: ViewStyle;
}

/** Fondo V4 — capa visual-expectation (nubes, corazones, ornamentos) */
export function CuteScreenBackground({ children, variant, style }: Props) {
  const source = variant === 'home' ? VisualAssets.bgHome : VisualAssets.bgGame;
  return (
    <ImageBackground source={source} style={[styles.bg, style]} resizeMode="cover">
      <View style={styles.scrim}>{children}</View>
    </ImageBackground>
  );
}

interface BrandProps {
  subtitle?: string;
  badge?: string;
}

/** Cabecera marca V4 — emblema + título bubbly estilo mockup */
export function BrandHeader({ subtitle, badge }: BrandProps) {
  return (
    <View style={styles.brandWrap}>
      <Image source={VisualAssets.emblem} style={styles.emblem} resizeMode="contain" />
      <Text style={styles.brand}>VISSIUSS</Text>
      <Text style={styles.title}>Sodoku nuevo</Text>
      {badge ? <Text style={styles.badge}>{badge}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: '100%', height: '100%' },
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(255,245,248,0.12)',
  },
  brandWrap: { alignItems: 'center', marginBottom: spacing.lg },
  emblem: { width: 72, height: 72, marginBottom: spacing.sm },
  brand: {
    color: colors.white,
    fontSize: 26,
    letterSpacing: 6,
    fontWeight: '900',
    textShadowColor: colors.textShadow,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  title: {
    color: colors.white,
    fontSize: typography.title,
    fontWeight: '900',
    textShadowColor: colors.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    // simula borde bubbly del mockup
    includeFontPadding: false,
  },
  badge: {
    marginTop: spacing.sm,
    color: colors.text,
    backgroundColor: colors.infoBg,
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: typography.small,
    fontWeight: '700',
    overflow: 'hidden',
  },
  subtitle: {
    marginTop: spacing.sm,
    color: colors.text,
    fontSize: typography.small,
    fontWeight: '600',
    backgroundColor: colors.infoBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
