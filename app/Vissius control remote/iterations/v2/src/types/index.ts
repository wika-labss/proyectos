export type TvProtocol = 'vissius' | 'roku';

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

export type RemoteCommand = NavigationCommand | VolumeCommand | LaunchCommand;

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
  lastCommand: RemoteCommand | null;
}

export type FeedbackTone = 'success' | 'warning' | 'error' | 'info';

export interface FeedbackMessage {
  text: string;
  tone: FeedbackTone;
}
