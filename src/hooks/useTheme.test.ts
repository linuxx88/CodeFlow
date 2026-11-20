import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';

describe('useTheme', () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => (key in store ? store[key] : null),
      setItem: (key: string, value: string) => {
        store[key] = String(value);
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    });
    document.documentElement.className = '';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('defaults to dark when localStorage is empty or invalid', () => {
    localStorage.setItem('app-theme', 'invalid-theme');
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('dark');
    expect(result.current.isDark).toBe(true);
    expect(document.documentElement.classList.contains('theme-dark')).toBe(true);
  });

  it('restores saved theme from localStorage and updates class on toggle/setTheme', () => {
    localStorage.setItem('app-theme', 'nord');
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('nord');
    expect(document.documentElement.classList.contains('theme-nord')).toBe(true);

    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('matrix');
    expect(localStorage.getItem('app-theme')).toBe('matrix');
    expect(document.documentElement.classList.contains('theme-nord')).toBe(false);
    expect(document.documentElement.classList.contains('theme-matrix')).toBe(true);

    act(() => {
      result.current.setTheme('cyberpunk');
    });
    expect(result.current.theme).toBe('cyberpunk');
    expect(document.documentElement.classList.contains('theme-cyberpunk')).toBe(true);
  });
});
