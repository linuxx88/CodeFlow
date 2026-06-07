import { useState, useEffect } from 'react'

interface UseConflictDataParams {
  activeFile?: string | null
  projectPath?: string
  scanData?: any
}

export function useConflictData({ activeFile, projectPath, scanData }: UseConflictDataParams) {
  const [conflictData, setConflictData] = useState<{
    ourParsed: any
    theirParsed: any
  } | null>(null)
  const [loadingConflict, setLoadingConflict] = useState(false)
  const [conflictError, setConflictError] = useState<string | null>(null)

  useEffect(() => {
    if (!activeFile || !projectPath) {
      setTimeout(() => {
        setConflictData(null)
      }, 0)
      return
    }

    const isConflicted = scanData?.git?.statuses?.[activeFile] === 'unmerged' || 
                         scanData?.git?.hotspots?.find((h: any) => h.file === activeFile)?.hasConflicts

    if (!isConflicted) {
      setTimeout(() => {
        setConflictData(null)
      }, 0)
      return
    }

    setTimeout(() => {
      setLoadingConflict(true)
      setConflictError(null)
    }, 0)

    fetch(`/api/parse-conflict?path=${encodeURIComponent(projectPath)}&file=${encodeURIComponent(activeFile)}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load conflict versions')
        return res.json()
      })
      .then(data => {
        setConflictData(data)
      })
      .catch(err => {
        setConflictError(err.message)
      })
      .finally(() => {
        setLoadingConflict(false)
      })
  }, [activeFile, projectPath, scanData])

  return {
    conflictData,
    setConflictData,
    loadingConflict,
    conflictError
  }
}
