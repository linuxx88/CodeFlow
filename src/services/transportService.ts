import { scanBreaker } from './circuitBreaker';
import { toast } from './toastService';

export interface ScanProgress {
  stage: string;
  current?: number;
  total?: number;
  message: string;
}

export interface ScanResult {
  structure: any;
  dependencies: any;
  git: any;
  conditionals: any;
  classes: any;
  loops: any;
  repeatLoops: any;
  algorithms: any;
  pythonStructures: any;
}

interface ScanOptions {
  projectPath: string;
  onProgress: (progress: ScanProgress) => void;
  onResult: (result: ScanResult) => void;
  signal?: AbortSignal;
  maxRetries?: number;
  baseDelay?: number;
}

/**
 * Scan project using Server-Sent Events with automated retries (exponential backoff)
 * and Circuit Breaker pattern.
 */
export async function scanProjectStream(options: ScanOptions): Promise<void> {
  const { projectPath, onProgress, onResult, signal, maxRetries = 3, baseDelay = 1500 } = options;
  let attempt = 0;

  while (true) {
    if (signal?.aborted) {
      throw new DOMException('Operation cancelled by user.', 'AbortError');
    }

    if (!scanBreaker.allowRequest()) {
      const errorMsg = 'Scanner is unavailable (Circuit Breaker open). Retries blocked for 15s.';
      toast.warning(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      if (attempt > 0) {
        onProgress({
          stage: 'connecting',
          message: `Reconnecting automatically (attempt ${attempt}/${maxRetries})...`,
        });
      }

      const url = `/api/scan?path=${encodeURIComponent(projectPath)}`;
      const response = await fetch(url, { signal });

      if (!response.ok) {
        if (response.status >= 400 && response.status < 500) {
          // Client error, e.g. path invalid. Don't retry, don't trigger breaker
          scanBreaker.recordSuccess();
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Configuration error (${response.status})`);
        } else {
          // Server error 5xx, or other status
          throw new Error(`Scan server returned an error (${response.status})`);
        }
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Scanner response stream is not readable.');
      }

      // Record success in Circuit Breaker on initial connection success
      scanBreaker.recordSuccess();

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          let parsed: any = null;
          try {
            parsed = JSON.parse(trimmed.substring(6));
          } catch (e) {
            console.error('SSE parsing error:', e);
            continue;
          }

          if (parsed.type === 'progress') {
            onProgress({
              stage: parsed.stage,
              current: parsed.current,
              total: parsed.total,
              message: parsed.message,
            });
          } else if (parsed.type === 'result') {
            onResult(parsed.result);
          } else if (parsed.type === 'error') {
            throw new Error(parsed.error);
          }
        }
      }

      // Scan completed successfully
      return;
    } catch (e: any) {
      const isAbort = e.name === 'AbortError' || signal?.aborted;
      if (isAbort) {
        throw e;
      }

      // Record failure on circuit breaker
      scanBreaker.recordFailure();

      attempt++;
      if (attempt > maxRetries) {
        toast.error(`Scan failed permanently after ${maxRetries} attempts: ${e.message}`);
        throw e;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 300;
      toast.warning(`Stream interrupted (${e.message}). Retrying ${attempt}/${maxRetries} in ${Math.round(delay)}ms...`);

      // Wait for delay or abort signal
      await new Promise((resolve) => {
        const timeout = setTimeout(resolve, delay);
        if (signal) {
          const onAbort = () => {
            clearTimeout(timeout);
            resolve(null);
          };
          signal.addEventListener('abort', onAbort);
        }
      });
    }
  }
}

/**
 * Standard fetch with retry helper for other APIs (e.g. /api/parse-conflict)
 */
export async function fetchWithRetry(url: string, options: RequestInit & { maxRetries?: number; baseDelay?: number } = {}): Promise<Response> {
  const { maxRetries = 3, baseDelay = 1000, signal, ...fetchOptions } = options;
  let attempt = 0;

  while (true) {
    if (signal?.aborted) {
      throw new DOMException('Operation cancelled.', 'AbortError');
    }

    try {
      const response = await fetch(url, { ...fetchOptions, signal });

      if (response.status >= 500) {
        throw new Error(`Server error (${response.status})`);
      }

      return response;
    } catch (error: any) {
      const isAbort = error.name === 'AbortError' || signal?.aborted;
      if (isAbort) {
        throw error;
      }

      attempt++;
      if (attempt > maxRetries) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 200;
      await new Promise((resolve) => {
        const timeout = setTimeout(resolve, delay);
        if (signal) {
          signal.addEventListener('abort', () => {
            clearTimeout(timeout);
            resolve(null);
          });
        }
      });
    }
  }
}

/**
 * Pings the health endpoint of the backend to verify connectivity.
 */
export async function checkBackendHealth(signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch('/api/health', { signal, cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  }
}
