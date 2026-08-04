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
}

export type ConnectionState = 'idle' | 'scanning' | 'connecting' | 'connected' | 'disconnected' | 'error';

export interface StoredTvPreferences {
  pairedDevice: TvDevice | null;
}

export interface TvStatus {
  power: boolean;
  volume: number;
  activeApp: StreamingAppId | null;
  lastCommand: RemoteCommand | null;
}
