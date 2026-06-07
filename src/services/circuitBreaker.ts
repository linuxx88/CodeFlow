export type BreakerState = 'CLOSED' | 'OPEN' | 'HALF-OPEN';

export interface CircuitBreakerState {
  state: BreakerState;
  failureCount: number;
  lastStateChange: number;
  cooldownPeriod: number;
}

type BreakerStateListener = (state: CircuitBreakerState) => void;

export class CircuitBreaker {
  private state: BreakerState = 'CLOSED';
  private failureCount = 0;
  private lastStateChange = Date.now();
  private readonly failureThreshold: number;
  private readonly cooldownPeriod: number;
  private listeners: Set<BreakerStateListener> = new Set();

  constructor(failureThreshold = 3, cooldownPeriod = 10000) {
    this.failureThreshold = failureThreshold;
    this.cooldownPeriod = cooldownPeriod;
  }

  subscribe(listener: BreakerStateListener) {
    this.listeners.add(listener);
    listener(this.getCurrentStateObject());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const stateObj = this.getCurrentStateObject();
    this.listeners.forEach((listener) => listener(stateObj));
  }

  private getCurrentStateObject(): CircuitBreakerState {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastStateChange: this.lastStateChange,
      cooldownPeriod: this.cooldownPeriod,
    };
  }

  getState(): BreakerState {
    if (this.state === 'OPEN' && Date.now() - this.lastStateChange > this.cooldownPeriod) {
      this.setState('HALF-OPEN');
    }
    return this.state;
  }

  private setState(state: BreakerState) {
    if (this.state !== state) {
      this.state = state;
      this.lastStateChange = Date.now();
      this.notify();
    }
  }

  allowRequest(): boolean {
    const currentState = this.getState();
    return currentState === 'CLOSED' || currentState === 'HALF-OPEN';
  }

  recordSuccess() {
    this.failureCount = 0;
    this.setState('CLOSED');
  }

  recordFailure() {
    this.failureCount++;
    if (this.state === 'HALF-OPEN' || this.failureCount >= this.failureThreshold) {
      this.setState('OPEN');
    } else {
      this.notify();
    }
  }
}

export const scanBreaker = new CircuitBreaker(3, 15000); // 3 failures threshold, 15s cooldown
