import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AVATAR_IDS, type AvatarId } from '../../constants/avatars';
import { bit, chrome, motion } from '../../design-system/tokens';
import { PixelText } from '../../components/pixel/PixelText';
import { AvatarPortrait } from './AvatarPortrait';

type Props = {
  selected: AvatarId;
  onSelect: (id: AvatarId) => void;
  onClose: () => void;
};

export function AvatarPicker({ selected, onSelect, onClose }: Props) {
  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <PixelText size="md" color={bit.cyan}>
          AVATAR
        </PixelText>
        <PixelText size="xs" color={bit.muted} style={styles.center}>
          PERFIL LOCAL
        </PixelText>
        <View style={styles.grid}>
          {AVATAR_IDS.map((id) => {
            const active = id === selected;
            return (
              <Pressable
                key={id}
                accessibilityRole="button"
                onPress={() => onSelect(id)}
                style={({ pressed }) => [
                  styles.slot,
                  active && styles.slotActive,
                  pressed && styles.pressed,
                ]}
              >
                <AvatarPortrait id={id} />
              </Pressable>
            );
          })}
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          style={({ pressed }) => [styles.close, pressed && styles.pressed]}
        >
          <PixelText size="sm" color={bit.ink}>
            LISTO
          </PixelText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: bit.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
    paddingHorizontal: 16,
  },
  panel: {
    width: '100%',
    backgroundColor: bit.panel,
    borderWidth: chrome.outline,
    borderColor: bit.pink,
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  slot: {
    borderWidth: chrome.outline,
    borderColor: bit.muted,
    padding: 4,
  },
  slotActive: {
    borderColor: bit.pink,
  },
  close: {
    minHeight: chrome.hit,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: bit.panel,
    borderWidth: chrome.outline,
    borderColor: bit.cyan,
    paddingHorizontal: 16,
  },
  center: {
    textAlign: 'center',
  },
  pressed: {
    opacity: motion.pressOpacity,
  },
});
