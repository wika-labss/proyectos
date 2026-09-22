import React from 'react';
import { VaporwaveBackdrop } from '../../modules/arkanoid-ui-kit';

type Props = {
  children: React.ReactNode;
};

/** Alias VE: mundo vaporwave, no pack Castillo. */
export function EightBitBackdrop({ children }: Props) {
  return <VaporwaveBackdrop>{children}</VaporwaveBackdrop>;
}
