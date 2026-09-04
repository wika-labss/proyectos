import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { colors, radius, spacing } from '../constants/theme';
import { AVATARS, type AvatarId } from '../data/avatars';

type Props = {
  selected: AvatarId | null;
  onSelect: (id: AvatarId) => void;
};

export function AvatarGrid({ selected, onSelect }: Props) {
  return (
    <View style={styles.grid}>
      {AVATARS.map((avatar) => {
        const active = selected === avatar.id;
        return (
          <Pressable
            key={avatar.id}
            accessibilityRole="button"
            accessibilityLabel={avatar.id}
            onPress={() => onSelect(avatar.id)}
            style={[styles.cell, active && styles.active]}
          >
            <Image
              source={avatar.source}
              style={styles.img}
              resizeMode="contain"
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },
  cell: {
    width: 96,
    height: 96,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.locked,
  },
  active: {
    borderColor: colors.accent,
  },
  img: {
    width: '100%',
    height: '100%',
  },
});
