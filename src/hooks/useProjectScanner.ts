import { useState, useRef, useEffect } from 'react';
import { scanProjectStream } from '../services/transportService';

interface UseProjectScannerOptions {
  onScanStart?: () => void;
}

/**
 * Custom hook to orchestrate project scanning via Server-Sent Events (SSE).
 * Manages path state, scan status, live progress, and final scan data.
 * Integrates transport resilience (retries/backoff) and Circuit Breaker.
 */
export function useProjectScanner(options?: UseProjectScannerOptions) {
  const [projectPath, setProjectPath] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<{ stage: string; current?: number; total?: number; message: string } | null>(null);
  const [scanData, setScanData] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const cancelScan = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const scanProject = async () => {
    const trimmedPath = projectPath.trim();
    if (!trimmedPath) return;
    
    // Cancel any ongoing scan
    cancelScan();

    setIsScanning(true);
    setScanError(null);
    setScanProgress({ stage: 'reading', message: 'Starting scan...' });
    
    // Trigger initialization callback (e.g., reset UI filters)
    if (options?.onScanStart) {
      options.onScanStart();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await scanProjectStream({
        projectPath: trimmedPath,
        onProgress: (progress) => {
          if (!isMountedRef.current) return;
          setScanProgress({
            stage: progress.stage,
            current: progress.current,
            total: progress.total,
            message: progress.message
          });
        },
        onResult: (result) => {
          if (!isMountedRef.current) return;
          setScanData(result);
        },
        signal: controller.signal,
      });
    } catch (e: any) {
      if (!isMountedRef.current) return;
      if (e.name === 'AbortError') {
        setScanError('Scan was cancelled.');
      } else {
        setScanError(e.message || 'An unknown error occurred during the scan.');
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      if (isMountedRef.current) {
        setIsScanning(false);
        setScanProgress(null);
      }
    }
  };

  return {
    projectPath,
    setProjectPath,
    isScanning,
    scanProgress,
    scanData,
    setScanData,
    scanProject,
    cancelScan,
    scanError,
    setScanError
  };
}
