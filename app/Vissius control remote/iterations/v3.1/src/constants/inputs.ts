import type { InputId } from '../types';

export interface TvInputOption {
  id: InputId;
  label: string;
  command: `input_${InputId}`;
}

export const TV_INPUTS: TvInputOption[] = [
  { id: 'hdmi1', label: 'HDMI 1', command: 'input_hdmi1' },
  { id: 'hdmi2', label: 'HDMI 2', command: 'input_hdmi2' },
  { id: 'hdmi3', label: 'HDMI 3', command: 'input_hdmi3' },
  { id: 'hdmi4', label: 'HDMI 4', command: 'input_hdmi4' },
  { id: 'av', label: 'AV', command: 'input_av' },
  { id: 'tv', label: 'TV / Tuner', command: 'input_tv' },
];
