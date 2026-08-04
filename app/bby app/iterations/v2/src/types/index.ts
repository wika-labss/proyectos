export type TorchMode = 'off' | 'on' | 'sos';

export type SosAction = 'on' | 'off';

export interface SosStep {
  action: SosAction;
  durationMs: number;
}

export interface StoredPreferences {
  intensity: number;
}

export interface TorchController {
  setTorch: (enabled: boolean) => void;
  applyIntensity: (intensity: number) => void;
  stopIntensity: () => void;
}
