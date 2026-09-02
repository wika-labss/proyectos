import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { colors } from '../../design-system';

/** Marco de teléfono solo en web — preview tipo emulador. */
export function PhoneShell({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }
  return (
    <View style={styles.stage}>
      <View style={styles.bezel}>
        <View style={styles.notch} />
        <View style={styles.screen}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    backgroundColor: colors.nightDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bezel: {
    width: 390,
    height: 844,
    backgroundColor: colors.outline,
    borderRadius: 36,
    padding: 10,
    overflow: 'hidden',
  },
  notch: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    width: 120,
    height: 22,
    borderRadius: 12,
    backgroundColor: colors.nightDeep,
    zIndex: 2,
    left: 135,
  },
  screen: {
    flex: 1,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: colors.night,
  },
});
