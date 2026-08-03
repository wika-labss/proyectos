const PWM_PERIOD_MS = 20;

interface IntensityControllerDeps {
  setTorchState: (enabled: boolean) => void;
}

// v1: PWM software fallback only. Native torch strength (Android 13+) is out of scope.
export class IntensityController {
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private running = false;

  constructor(private readonly deps: IntensityControllerDeps) {}

  apply(intensity: number): void {
    this.stop();

    const clamped = Math.max(0, Math.min(100, Math.round(intensity)));

    if (clamped <= 0) {
      this.deps.setTorchState(false);
      return;
    }

    if (clamped >= 100) {
      this.deps.setTorchState(true);
      return;
    }

    const onDuration = Math.max(1, Math.round((PWM_PERIOD_MS * clamped) / 100));
    const offDuration = Math.max(1, PWM_PERIOD_MS - onDuration);
    let isOn = true;

    this.running = true;
    this.deps.setTorchState(true);

    const tick = () => {
      if (!this.running) {
        return;
      }

      isOn = !isOn;
      this.deps.setTorchState(isOn);
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
}
