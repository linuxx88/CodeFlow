import { useState, useEffect } from 'react'

interface UseConflictDataParams {
  activeFile?: string | null
  projectPath?: string
  scanData?: any
}

interface ConflictResult {
  key: string
  ourParsed: any
  theirParsed: any
}

export function useConflictData({ activeFile, projectPath, scanData }: UseConflictDataParams) {
  const [result, setResult] = useState<ConflictResult | null>(null)
  const [loadingKey, setLoadingKey] = useState<string | null>(null)
  const [errorState, setErrorState] = useState<{ key: string; message: string } | null>(null)

  const isConflicted = Boolean(
    activeFile &&
    projectPath &&
    (scanData?.git?.statuses?.[activeFile] === 'unmerged' ||
      scanData?.git?.hotspots?.find((h: any) => h.file === activeFile)?.hasConflicts)
  )

  const currentKey = isConflicted ? `${projectPath}::${activeFile}` : null

  useEffect(() => {
    if (!currentKey || !activeFile || !projectPath) {
      return
    }

    const controller = new AbortController()
    let active = true

    Promise.resolve().then(() => {
      if (!active || controller.signal.aborted) return
      setLoadingKey(currentKey)
      setErrorState(null)

      fetch(`/api/parse-conflict?path=${encodeURIComponent(projectPath)}&file=${encodeURIComponent(activeFile)}`, {
        signal: controller.signal
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to load conflict versions')
          return res.json()
        })
        .then(data => {
          if (active && !controller.signal.aborted) {
            setResult({ key: currentKey, ourParsed: data.ourParsed, theirParsed: data.theirParsed })
          }
        })
        .catch(err => {
          if (active && err.name !== 'AbortError' && !controller.signal.aborted) {
            setErrorState({ key: currentKey, message: err.message })
          }
        })
        .finally(() => {
          if (active && !controller.signal.aborted) {
            setLoadingKey(prev => (prev === currentKey ? null : prev))
          }
        })
    })

    return () => {
      active = false
      controller.abort()
    }
  }, [currentKey, activeFile, projectPath])

  const conflictData = currentKey && result?.key === currentKey
    ? { ourParsed: result.ourParsed, theirParsed: result.theirParsed }
    : null
  const loadingConflict = Boolean(currentKey && loadingKey === currentKey)
  const conflictError = currentKey && errorState?.key === currentKey ? errorState.message : null

  return {
    conflictData,
    loadingConflict,
    conflictError
  }
}
