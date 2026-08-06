import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, layout } from '../constants/theme';
import { RemoteButton } from './RemoteButton';

interface ScreenHeaderProps {
  title: string;
  showChangeTv?: boolean;
  onChangeTv?: () => void;
}

export function ScreenHeader({ title, showChangeTv = false, onChangeTv }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {showChangeTv && onChangeTv ? (
        <RemoteButton compact label="← Cambiar TV" onPress={onChangeTv} style={styles.changeButton} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundStrong,
    gap: 12,
    paddingBottom: 16,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 48,
  },
  title: {
    color: colors.textOnStrong,
    fontSize: 22,
    fontWeight: '700',
  },
  changeButton: {
    alignSelf: 'flex-start',
  },
});
