import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { scanProjectStream, fetchWithRetry, checkBackendHealth } from './transportService';
import { scanBreaker } from './circuitBreaker';

describe('transportService', () => {
  beforeEach(() => {
    scanBreaker.recordSuccess();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('streams SSE progress and result events in scanProjectStream', async () => {
    const encoder = new TextEncoder();
    const chunks = [
      encoder.encode('data: {"type":"progress","stage":"reading","message":"Reading..."}\n\n'),
      encoder.encode('data: {"type":"result","result":{"structure":{"name":"root"}}}\n\n'),
    ];
    let idx = 0;

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: {
        getReader: () => ({
          read: async () =>
            idx < chunks.length
              ? { value: chunks[idx++], done: false }
              : { value: undefined, done: true },
        }),
      },
    });
    vi.stubGlobal('fetch', mockFetch);

    const onProgress = vi.fn();
    const onResult = vi.fn();

    await scanProjectStream({
      projectPath: 'E:/CodeFlow',
      onProgress,
      onResult,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/scan?path=E%3A%2FCodeFlow',
      expect.objectContaining({ signal: undefined })
    );
    expect(onProgress).toHaveBeenCalledWith({
      stage: 'reading',
      current: undefined,
      total: undefined,
      message: 'Reading...',
    });
    expect(onResult).toHaveBeenCalledWith({ structure: { name: 'root' } });
  });

  it('does not retry on 4xx client errors', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Invalid path' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(
      scanProjectStream({
        projectPath: 'bad',
        onProgress: vi.fn(),
        onResult: vi.fn(),
        maxRetries: 2,
        baseDelay: 1,
      })
    ).rejects.toThrow('Invalid path');

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('retries 5xx responses in fetchWithRetry and succeeds on recovery', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: true, status: 200 });
    vi.stubGlobal('fetch', mockFetch);

    const res = await fetchWithRetry('/api/parse-conflict', {
      maxRetries: 2,
      baseDelay: 1,
    });

    expect(res.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('returns false in checkBackendHealth when fetch fails or returns non-ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network down')));
    expect(await checkBackendHealth()).toBe(false);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    expect(await checkBackendHealth()).toBe(true);
  });
});
