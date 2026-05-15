import { TimerPort } from '../ports/TimerPort.js';

export class GameTimerService {
  private timers: Map<string, string> = new Map();

  constructor(private timerPort: TimerPort) {}

  startTurnTimer(turnId: string, seconds: number, onExpire: (turnId: string) => void): string {
    if (this.timers.has(turnId)) {
      throw new Error(`Timer already active for turn ${turnId}`);
    }
    const timerId = this.timerPort.start(seconds, () => {
      if (this.timers.has(turnId)) {
        this.timers.delete(turnId);
        onExpire(turnId);
      }
    });
    this.timers.set(turnId, timerId);
    return timerId;
  }

  stopTurnTimer(turnId: string): void {
    const timerId = this.timers.get(turnId);
    if (timerId) {
      this.timerPort.stop(timerId);
      this.timers.delete(turnId);
    }
  }
}
