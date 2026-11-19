import React, { useEffect } from 'react'
import { useReactFlow, useNodes } from '@xyflow/react'

interface FitViewHandlerProps {
  triggerKey?: string | number
  padding?: number
}

/**
 * Re-centers and fits the React Flow viewport whenever layout parameters or node counts change.
 */
export const FitViewHandler: React.FC<FitViewHandlerProps> = ({ triggerKey, padding = 0.2 }) => {
  const { fitView } = useReactFlow()
  const nodes = useNodes()

  useEffect(() => {
    if (nodes.length === 0) return
    let rafId = 0
    const timer = setTimeout(() => {
      rafId = requestAnimationFrame(() => {
        fitView({ padding, duration: 250 })
      })
    }, 80)
    return () => {
      clearTimeout(timer)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [triggerKey, nodes.length, padding, fitView])

  return null
}
