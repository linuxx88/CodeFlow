import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { toast } from './toastService';

describe('toastService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    let current: { id: string }[] = [];
    const unsub = toast.subscribe((t) => {
      current = t;
    });
    unsub();
    current.forEach((t) => toast.dismiss(t.id));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds and auto-dismisses toasts after duration', () => {
    let latest: { id: string; type: string; message: string }[] = [];
    const unsub = toast.subscribe((list) => {
      latest = list;
    });

    toast.success('Saved!', 3000);
    expect(latest).toHaveLength(1);
    expect(latest[0]).toMatchObject({ type: 'success', message: 'Saved!' });

    vi.advanceTimersByTime(3000);
    expect(latest).toHaveLength(0);
    unsub();
  });

  it('deduplicates consecutive identical messages', () => {
    let latest: { id: string; message: string }[] = [];
    const unsub = toast.subscribe((list) => {
      latest = list;
    });

    toast.error('Connection lost', 0);
    toast.error('Connection lost', 0);
    expect(latest).toHaveLength(1);

    toast.warning('Different warning', 0);
    expect(latest).toHaveLength(2);

    latest.forEach((t) => toast.dismiss(t.id));
    unsub();
  });
});
