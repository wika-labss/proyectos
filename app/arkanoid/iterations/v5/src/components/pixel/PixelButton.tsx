import React from 'react';
import { ChromeButton } from '../../modules/arkanoid-ui-kit';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'fill' | 'ghost';
};

/** Legacy name. Chrome VE (panel + pink/cyan), no gold bevel v4. */
export function PixelButton(props: Props) {
  return <ChromeButton {...props} />;
}
