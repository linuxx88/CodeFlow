import { useState, useRef, useEffect } from 'react';
import { scanProjectStream } from '../services/transportService';

interface UseProjectScannerOptions {
  onScanStart?: () => void;
}

/**
 * Hook personnalisé pour orchestrer le scan d'un projet via Server-Sent Events (SSE).
 * Gère l'état du chemin, le statut du scan, la progression en direct et les données finales.
 * Intègre la résilience (retries/backoff) et le Circuit Breaker du service de transport.
 */
export function useProjectScanner(options?: UseProjectScannerOptions) {
  const [projectPath, setProjectPath] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<{ stage: string; current?: number; total?: number; message: string } | null>(null);
  const [scanData, setScanData] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const cancelScan = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  // Nettoyage lors du démontage du composant
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const scanProject = async () => {
    if (!projectPath) return;
    
    // Annuler tout scan en cours
    cancelScan();

    setIsScanning(true);
    setScanError(null);
    setScanProgress({ stage: 'reading', message: 'Démarrage du scan...' });
    
    // Déclenche l'événement d'initialisation (ex: réinitialisation des filtres de l'interface)
    if (options?.onScanStart) {
      options.onScanStart();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await scanProjectStream({
        projectPath,
        onProgress: (progress) => {
          setScanProgress({
            stage: progress.stage,
            current: progress.current,
            total: progress.total,
            message: progress.message
          });
        },
        onResult: (result) => {
          setScanData(result);
        },
        signal: controller.signal,
      });
    } catch (e: any) {
      if (e.name === 'AbortError') {
        setScanError('Le scan a été annulé.');
      } else {
        setScanError(e.message || 'Une erreur inconnue est survenue lors du scan.');
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setIsScanning(false);
      setScanProgress(null);
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
