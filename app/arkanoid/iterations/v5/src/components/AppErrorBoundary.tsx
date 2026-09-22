import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { bit, chrome, motion } from '../design-system/tokens';
import { PixelText } from './pixel/PixelText';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={styles.root}>
        <PixelText size="xs" color={bit.pink}>
          WIKA 8-BIT
        </PixelText>
        <PixelText size="lg" color={bit.cyan}>
          ARKANOID
        </PixelText>
        <PixelText size="sm" color={bit.ink}>
          ERROR AL ABRIR
        </PixelText>
        <PixelText size="xs" color={bit.muted} style={styles.detail}>
          {this.state.error.message}
        </PixelText>
        <Pressable
          accessibilityRole="button"
          onPress={() => this.setState({ error: null })}
          style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
        >
          <PixelText size="sm" color={bit.ink}>
            REINTENTAR
          </PixelText>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: bit.night,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  detail: {
    textAlign: 'center',
  },
  btn: {
    marginTop: 12,
    minHeight: chrome.hit,
    borderWidth: chrome.outline,
    borderColor: bit.pink,
    backgroundColor: bit.panel,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  pressed: {
    opacity: motion.pressOpacity,
  },
});
