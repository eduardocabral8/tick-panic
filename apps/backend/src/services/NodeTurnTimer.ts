import { TimerPort } from '@tick-panic/domain';

export class NodeTurnTimer implements TimerPort {
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  start(durationSeconds: number, onExpire: () => void): string {
    const timerId = crypto.randomUUID();
    const timer = setTimeout(() => {
      onExpire();
      this.timers.delete(timerId);
    }, durationSeconds * 1000 + 1500);
    this.timers.set(timerId, timer);
    return timerId;
  }

  stop(timerId: string): void {
    const timer = this.timers.get(timerId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(timerId);
    }
  }
}
