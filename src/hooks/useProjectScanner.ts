import { useState } from 'react'

interface UseProjectScannerOptions {
  onScanStart?: () => void
}

/**
 * Hook personnalisé pour orchestrer le scan d'un projet via Server-Sent Events (SSE).
 * Gère l'état du chemin, le statut du scan, la progression en direct et les données finales.
 */
export function useProjectScanner(options?: UseProjectScannerOptions) {
  const [projectPath, setProjectPath] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState<{ stage: string; current?: number; total?: number; message: string } | null>(null)
  const [scanData, setScanData] = useState<any>(null)
  const [scanError, setScanError] = useState<string | null>(null)

  const scanProject = async () => {
    if (!projectPath) return
    setIsScanning(true)
    setScanError(null)
    setScanProgress({ stage: 'reading', message: 'Démarrage du scan...' })
    
    // Déclenche l'événement d'initialisation (ex: réinitialisation des filtres de l'interface)
    if (options?.onScanStart) {
      options.onScanStart()
    }
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, 10000)

    try {
      // Connexion SSE au point de terminaison de scan de l'API
      const response = await fetch(`/api/scan?path=${encodeURIComponent(projectPath)}`, {
        signal: controller.signal
      })
      if (!response.ok) {
        throw new Error('Erreur de connexion au scanner')
      }
      
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("Le flux de réponse n'est pas lisible")
      }
      
      const decoder = new TextDecoder()
      let buffer = ''
      
      // Boucle de lecture asynchrone du flux SSE par morceaux (chunks)
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        
        // Décodage du chunk reçu et ajout au tampon (buffer)
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        // Conserve la dernière ligne incomplète dans le tampon pour le prochain chunk
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          const trimmed = line.trim()
          // Filtre uniquement les messages SSE préfixés par 'data: '
          if (!trimmed || !trimmed.startsWith('data: ')) continue
          
          let parsed: any = null
          try {
            parsed = JSON.parse(trimmed.substring(6))
          } catch (e: any) {
            console.error('Erreur parsing SSE:', e)
            continue
          }
          
          // Traitement des types de messages envoyés par le serveur
          if (parsed.type === 'progress') {
            setScanProgress({
              stage: parsed.stage,
              current: parsed.current,
              total: parsed.total,
              message: parsed.message
            })
          } else if (parsed.type === 'result') {
            setScanData(parsed.result)
          } else if (parsed.type === 'error') {
            throw new Error(parsed.error)
          }
        }
      }
    } catch (e: any) {
      if (e.name === 'AbortError') {
        setScanError('Le scan a expiré après 10 secondes (Timeout).')
      } else {
        setScanError(`Erreur de scan: ${e.message}`)
      }
    } finally {
      clearTimeout(timeoutId)
      setIsScanning(false)
      setScanProgress(null)
    }
  }

  return {
    projectPath,
    setProjectPath,
    isScanning,
    scanProgress,
    scanData,
    setScanData,
    scanProject,
    scanError,
    setScanError
  }
}
