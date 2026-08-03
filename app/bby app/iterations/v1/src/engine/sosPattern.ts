import type { SosStep } from '../types';

const DOT_ON = 200;
const DOT_OFF = 200;
const DASH_ON = 600;
const DASH_OFF = 200;
const CYCLE_PAUSE = 1000;
// Inter-letter Morse gap: 600 ms total; each group ends with 200 ms OFF after the last symbol.
const INTER_LETTER_GAP_MS = 400;

function appendSignal(steps: SosStep[], onMs: number, offMs: number, count: number): void {
  for (let index = 0; index < count; index += 1) {
    steps.push({ action: 'on', durationMs: onMs });
    steps.push({ action: 'off', durationMs: offMs });
  }
}

function appendInterLetterGap(steps: SosStep[]): void {
  steps.push({ action: 'off', durationMs: INTER_LETTER_GAP_MS });
}

export function buildSosPattern(): SosStep[] {
  const steps: SosStep[] = [];
  appendSignal(steps, DOT_ON, DOT_OFF, 3);
  appendInterLetterGap(steps);
  appendSignal(steps, DASH_ON, DASH_OFF, 3);
  appendInterLetterGap(steps);
  appendSignal(steps, DOT_ON, DOT_OFF, 3);
  steps.push({ action: 'off', durationMs: CYCLE_PAUSE });
  return steps;
}

export const SOS_PATTERN = buildSosPattern();
