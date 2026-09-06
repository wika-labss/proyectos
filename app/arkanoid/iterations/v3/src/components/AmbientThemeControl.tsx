import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { menu, play } from '../constants/theme';
import { AMBIENT_THEMES, type AmbientThemeId } from '../modules/ambient-audio';

type Tone = 'future' | 'retro';

type Props = {
  theme: AmbientThemeId;
  onChange: (id: AmbientThemeId) => void;
  tone?: Tone;
};

export function AmbientThemeControl({ theme, onChange, tone = 'future' }: Props) {
  const colors = tone === 'future'
    ? { label: menu.muted, text: menu.text, active: menu.neon, border: menu.magenta }
    : { label: play.muted, text: play.hud, active: play.hud, border: play.wall };

  return (
    <View style={styles.wrap} accessibilityRole="radiogroup" accessibilityLabel="Tema ambiente">
      <Text style={[styles.label, { color: colors.label }]}>Tema</Text>
      <View style={styles.row}>
        {AMBIENT_THEMES.map((item) => {
          const active = item.id === theme;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Tema ${item.label}`}
              onPress={() => onChange(item.id)}
              style={({ pressed }) => [
                styles.chip,
                { borderColor: active ? colors.active : colors.border },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.chipText, { color: active ? colors.active : colors.text }]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
});
