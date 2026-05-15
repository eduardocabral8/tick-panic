export interface TimerPort {
  start(durationSeconds: number, onExpire: () => void): string;
  stop(timerId: string): void;
}
