import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProjectScanner } from './useProjectScanner';
import * as transportService from '../services/transportService';

vi.mock('../services/transportService', () => ({
  scanProjectStream: vi.fn(),
}));

describe('useProjectScanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ignores blank projectPath without calling scanProjectStream', async () => {
    const { result } = renderHook(() => useProjectScanner());

    act(() => {
      result.current.setProjectPath('   ');
    });

    await act(async () => {
      await result.current.scanProject();
    });

    expect(transportService.scanProjectStream).not.toHaveBeenCalled();
    expect(result.current.isScanning).toBe(false);
  });

  it('trims path, streams progress and result, and resets isScanning', async () => {
    const onScanStart = vi.fn();
    vi.mocked(transportService.scanProjectStream).mockImplementation(async ({ onProgress, onResult }) => {
      onProgress({ stage: 'analyzing', current: 1, total: 2, message: 'Analyzing...' });
      onResult({ structure: { name: 'CodeFlow' } } as any);
    });

    const { result } = renderHook(() => useProjectScanner({ onScanStart }));

    act(() => {
      result.current.setProjectPath('  E:\\CodeFlow  ');
    });

    await act(async () => {
      await result.current.scanProject();
    });

    expect(onScanStart).toHaveBeenCalledTimes(1);
    expect(transportService.scanProjectStream).toHaveBeenCalledWith(
      expect.objectContaining({ projectPath: 'E:\\CodeFlow' })
    );
    expect(result.current.scanData).toEqual({ structure: { name: 'CodeFlow' } });
    expect(result.current.isScanning).toBe(false);
    expect(result.current.scanError).toBeNull();
  });

  it('sets scanError when scanProjectStream fails or aborts', async () => {
    vi.mocked(transportService.scanProjectStream).mockRejectedValueOnce(new Error('Backend down'));

    const { result } = renderHook(() => useProjectScanner());
    act(() => {
      result.current.setProjectPath('E:\\CodeFlow');
    });

    await act(async () => {
      await result.current.scanProject();
    });

    expect(result.current.scanError).toBe('Backend down');
    expect(result.current.isScanning).toBe(false);

    vi.mocked(transportService.scanProjectStream).mockRejectedValueOnce(
      new DOMException('Cancelled', 'AbortError')
    );

    await act(async () => {
      await result.current.scanProject();
    });

    expect(result.current.scanError).toBe('Scan was cancelled.');
  });
});
