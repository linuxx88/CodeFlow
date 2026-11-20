import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CircuitBreaker } from './circuitBreaker';

describe('CircuitBreaker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts in CLOSED state and allows requests', () => {
    const breaker = new CircuitBreaker(3, 10000);
    expect(breaker.getState()).toBe('CLOSED');
    expect(breaker.allowRequest()).toBe(true);
  });

  it('opens after reaching failure threshold and blocks requests', () => {
    const breaker = new CircuitBreaker(2, 5000);
    breaker.recordFailure();
    expect(breaker.getState()).toBe('CLOSED');
    expect(breaker.allowRequest()).toBe(true);

    breaker.recordFailure();
    expect(breaker.getState()).toBe('OPEN');
    expect(breaker.allowRequest()).toBe(false);
  });

  it('transitions to HALF-OPEN after cooldown and closes on success', () => {
    const breaker = new CircuitBreaker(2, 5000);
    breaker.recordFailure();
    breaker.recordFailure();
    expect(breaker.getState()).toBe('OPEN');

    vi.advanceTimersByTime(5001);
    expect(breaker.getState()).toBe('HALF-OPEN');
    expect(breaker.allowRequest()).toBe(true);

    breaker.recordSuccess();
    expect(breaker.getState()).toBe('CLOSED');
  });

  it('re-opens immediately if a failure occurs in HALF-OPEN', () => {
    const breaker = new CircuitBreaker(2, 5000);
    breaker.recordFailure();
    breaker.recordFailure();

    vi.advanceTimersByTime(5001);
    expect(breaker.getState()).toBe('HALF-OPEN');

    breaker.recordFailure();
    expect(breaker.getState()).toBe('OPEN');
  });

  it('notifies subscribers on state changes and supports unsubscribe', () => {
    const breaker = new CircuitBreaker(1, 1000);
    const listener = vi.fn();
    const unsubscribe = breaker.subscribe(listener);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenLastCalledWith(
      expect.objectContaining({ state: 'CLOSED', failureCount: 0 })
    );

    breaker.recordFailure();
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith(
      expect.objectContaining({ state: 'OPEN', failureCount: 1 })
    );

    unsubscribe();
    breaker.recordSuccess();
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
