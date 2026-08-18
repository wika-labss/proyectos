import React from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../app-theme';
import { UiAssets } from './assets';

interface Props {
  levelId: number;
  unlocked: boolean;
  completed: boolean;
  onPress?: () => void;
}

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
  wrap: { width: 72, height: 72 },
  tile: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  img: { borderRadius: 14 },
  id: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    textShadowColor: 'rgba(255,245,248,0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  locked: { color: colors.locked, opacity: 0.7 },
});
