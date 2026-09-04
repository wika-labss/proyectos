import { Platform } from 'react-native';

/** Animated native driver no está soportado en web. */
export const nativeDriver = Platform.OS !== 'web';
