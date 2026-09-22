import React from 'react';
import { StyleSheet, View } from 'react-native';
import { bit, chrome } from '../../design-system/tokens';

const STARS = [
  { t: 6, l: 8 },
  { t: 14, l: 28 },
  { t: 10, l: 62 },
  { t: 22, l: 80 },
  { t: 18, l: 46 },
  { t: 8, l: 90 },
  { t: 28, l: 16 },
  { t: 32, l: 70 },
];

type Props = {
  children?: React.ReactNode;
};

export function VaporwaveBackdrop({ children }: Props) {
  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={styles.sky}>
        {STARS.map((s, i) => (
          <View key={i} style={[styles.star, { top: `${s.t}%`, left: `${s.l}%` }]} />
        ))}
        <View style={styles.sun}>
          {Array.from({ length: 8 }, (_, i) => (
            <View
              key={i}
              style={[
                styles.sunBand,
                { backgroundColor: i % 2 === 0 ? bit.pink : bit.night, opacity: i % 2 === 0 ? 1 : 0.55 },
              ]}
            />
          ))}
        </View>
        <View style={styles.mountA} />
        <View style={styles.mountB} />
        <View style={styles.palmLeft} />
        <View style={styles.palmRight} />
        <View style={styles.grid}>
          {Array.from({ length: 8 }, (_, i) => (
            <View key={`h-${i}`} style={[styles.gridH, { top: `${i * 12}%` }]} />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <View key={`v-${i}`} style={[styles.gridV, { left: `${i * 12}%` }]} />
          ))}
        </View>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: bit.night,
  },
  sky: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  star: {
    position: 'absolute',
    width: 3,
    height: 3,
    backgroundColor: bit.ink,
  },
  sun: {
    position: 'absolute',
    top: '8%',
    alignSelf: 'center',
    width: 120,
    height: 120,
    overflow: 'hidden',
    borderRadius: 60,
    left: '50%',
    marginLeft: -60,
  },
  sunBand: {
    flex: 1,
  },
  mountA: {
    position: 'absolute',
    bottom: '38%',
    left: -20,
    width: 0,
    height: 0,
    borderLeftWidth: 90,
    borderRightWidth: 90,
    borderBottomWidth: 70,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: bit.panel,
  },
  mountB: {
    position: 'absolute',
    bottom: '38%',
    right: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 110,
    borderRightWidth: 110,
    borderBottomWidth: 86,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: bit.purple,
  },
  palmLeft: {
    position: 'absolute',
    left: 6,
    top: 18,
    width: 10,
    height: 90,
    backgroundColor: bit.night,
    borderWidth: chrome.hairline,
    borderColor: bit.panel,
  },
  palmRight: {
    position: 'absolute',
    right: 6,
    top: 22,
    width: 10,
    height: 90,
    backgroundColor: bit.night,
    borderWidth: chrome.hairline,
    borderColor: bit.panel,
  },
  grid: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '42%',
  },
  gridH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: bit.cyan,
    opacity: 0.35,
  },
  gridV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: bit.cyan,
    opacity: 0.22,
  },
});
