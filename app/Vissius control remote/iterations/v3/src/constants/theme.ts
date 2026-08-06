export const colors = {
  backgroundSoft: '#F7B9AD',
  backgroundStrong: '#E83A17',
  buttonBackground: '#000000',
  buttonText: '#FFFFFF',
  buttonPressed: '#1A1A1A',
  textOnSoft: '#000000',
  textOnStrong: '#FFFFFF',
  splashBackground: '#000000',
  splashText: '#FFFFFF',
  feedbackSuccess: '#1B5E20',
  feedbackWarning: '#E65100',
  feedbackError: '#B71C1C',
} as const;

export { volume } from './volume';

export const layout = {
  minTouchTarget: 48,
  buttonRadius: 10,
  screenPadding: 20,
} as const;
