// Software PWM over the camera torch. React Native timers cannot reliably fire
// below ~4 ms, so pulses are clamped and the usable duty cycle saturates at the
// edges: see MIN_DUTY_PERCENT / MAX_DUTY_PERCENT.
const PWM_PERIOD_MS = 20;
const MIN_PULSE_MS = 4;

export const MIN_DUTY_PERCENT = (MIN_PULSE_MS / PWM_PERIOD_MS) * 100;
export const MAX_DUTY_PERCENT = 100 - MIN_DUTY_PERCENT;

interface IntensityControllerDeps {
  setTorchState: (enabled: boolean) => void;
}

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

    const rawOn = Math.round((PWM_PERIOD_MS * clamped) / 100);
    const onDuration = Math.min(Math.max(rawOn, MIN_PULSE_MS), PWM_PERIOD_MS - MIN_PULSE_MS);
    const offDuration = PWM_PERIOD_MS - onDuration;
    let isOn = true;

    this.running = true;
    this.deps.setTorchState(true);

    const tick = () => {
      if (!this.running) {
        return;
      }

      isOn = !isOn;
      this.deps.setTorchState(isOn);
      this.timeoutId = setTimeout(tick, isOn ? onDuration : offDuration);
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
