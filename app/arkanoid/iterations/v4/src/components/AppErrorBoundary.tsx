import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { bit } from '../constants/theme';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

/** Si un módulo nativo o la UI fallan, el usuario ve esto en vez de una pantalla negra. */
export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={styles.root}>
        <Text style={styles.kicker}>WIKA 8-BIT</Text>
        <Text style={styles.title}>ARKANOID</Text>
        <Text style={styles.body}>ERROR AL ABRIR</Text>
        <Text style={styles.detail}>{this.state.error.message}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => this.setState({ error: null })}
          style={styles.btn}
        >
          <Text style={styles.btnText}>REINTENTAR</Text>
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
  kicker: {
    color: bit.pink,
    fontSize: 12,
    letterSpacing: 2,
  },
  title: {
    color: bit.gold,
    fontSize: 28,
    fontWeight: '800',
  },
  body: {
    color: bit.ink,
    fontSize: 14,
  },
  detail: {
    color: bit.muted,
    fontSize: 12,
    textAlign: 'center',
  },
  btn: {
    marginTop: 12,
    borderWidth: 3,
    borderColor: bit.gold,
    backgroundColor: bit.panel,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  btnText: {
    color: bit.gold,
    fontWeight: '700',
  },
});
