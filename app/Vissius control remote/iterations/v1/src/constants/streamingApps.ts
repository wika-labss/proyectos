import type { StreamingAppId } from '../types';

export interface StreamingAppDefinition {
  id: StreamingAppId;
  label: string;
  command: `launch_${StreamingAppId}`;
}

export const STREAMING_APPS: StreamingAppDefinition[] = [
  { id: 'netflix', label: 'Netflix', command: 'launch_netflix' },
  { id: 'hbo', label: 'HBO', command: 'launch_hbo' },
  { id: 'youtube', label: 'YouTube', command: 'launch_youtube' },
  { id: 'crunchyroll', label: 'Crunchyroll', command: 'launch_crunchyroll' },
];
