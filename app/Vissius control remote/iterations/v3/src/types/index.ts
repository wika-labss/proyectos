export type TvProtocol = 'vissius' | 'roku' | 'androidtv';

export type NavigationCommand =
  | 'nav_up'
  | 'nav_down'
  | 'nav_left'
  | 'nav_right'
  | 'ok'
  | 'back';

export type VolumeCommand = 'vol_up' | 'vol_down';

export type StreamingAppId = 'netflix' | 'hbo' | 'youtube' | 'crunchyroll';

export type LaunchCommand = `launch_${StreamingAppId}`;

export type InputId = 'hdmi1' | 'hdmi2' | 'hdmi3' | 'hdmi4' | 'av' | 'tv';

export type InputCommand = `input_${InputId}`;

export type RemoteCommand = NavigationCommand | VolumeCommand | LaunchCommand | InputCommand;

export interface TvDevice {
  id: string;
  name: string;
  ip: string;
  port: number;
  protocol: TvProtocol;
}

export type ConnectionState =
  | 'idle'
  | 'scanning'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

export interface StoredTvPreferences {
  pairedDevice: TvDevice | null;
}

export interface TvStatus {
  power: boolean;
  volume: number;
  muted: boolean;
  activeApp: StreamingAppId | null;
  activeInput: InputId | null;
  lastCommand: RemoteCommand | null;
}

export type FeedbackTone = 'success' | 'warning' | 'error' | 'info';

export interface FeedbackMessage {
  text: string;
  tone: FeedbackTone;
}

export interface ScanProgress {
  scanned: number;
  total: number;
  found: number;
  phase: string;
}
