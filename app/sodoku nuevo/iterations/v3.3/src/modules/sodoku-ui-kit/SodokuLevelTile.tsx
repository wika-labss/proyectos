import React from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontWeight, layout, radius } from '../../design-system';
import { UiAssets } from './assets';

interface Props {
  levelId: number;
  unlocked: boolean;
  completed: boolean;
  onPress?: () => void;
}

/** SodokuLevelTile — spec: design-system/components/sodoku-ui-kit/sodoku-level-tile */
export function SodokuLevelTile({ levelId, unlocked, completed, onPress }: Props) {
  const source = !unlocked
    ? UiAssets.tileLocked
    : completed
      ? UiAssets.tileDone
      : UiAssets.tileUnlocked;

  const content = (
    <ImageBackground source={source} style={styles.tile} imageStyle={styles.img} resizeMode="cover">
      <Text style={[styles.id, !unlocked && styles.locked]}>{levelId}</Text>
    </ImageBackground>
  );

  if (!unlocked || !onPress) {
    return <View style={styles.wrap}>{content}</View>;
  }

  return (
    <Pressable style={styles.wrap} onPress={onPress} accessibilityLabel={`Nivel ${levelId}`}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: layout.tileSize, height: layout.tileSize },
  tile: {
    width: layout.tileSize,
    height: layout.tileSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: { borderRadius: radius.lg },
  id: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    textShadowColor: colors.blush,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  locked: { color: colors.locked, opacity: 0.7 },
});
