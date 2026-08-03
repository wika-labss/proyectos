import type { TorchController } from '../types';

const PWM_PERIOD_MS = 20;

export class IntensityController {
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private running = false;

  constructor(private readonly controller: Pick<TorchController, 'setTorch'>) {}

  apply(intensity: number): void {
    this.stop();

    const clamped = Math.max(0, Math.min(100, Math.round(intensity)));

    if (clamped <= 0) {
      this.controller.setTorch(false);
      return;
    }

    if (clamped >= 100) {
      this.controller.setTorch(true);
      return;
    }

    const onDuration = Math.max(1, Math.round((PWM_PERIOD_MS * clamped) / 100));
    const offDuration = Math.max(1, PWM_PERIOD_MS - onDuration);
    let isOn = true;

    this.running = true;
    this.controller.setTorch(true);

    const tick = () => {
      if (!this.running) {
        return;
      }

      isOn = !isOn;
      this.controller.setTorch(isOn);
      const delay = isOn ? onDuration : offDuration;
      this.timeoutId = setTimeout(tick, delay);
    };

    this.timeoutId = setTimeout(tick, onDuration);
  }

  stop(): void {
    this.running = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  turnOff(): void {
    this.stop();
    this.controller.setTorch(false);
  }
}
