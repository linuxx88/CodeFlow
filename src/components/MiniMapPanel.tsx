import React, { useEffect } from 'react'
import { MiniMap, useReactFlow, useNodes } from '@xyflow/react'
import { useTheme } from '../hooks/useTheme'

interface MiniMapPanelProps {
  style?: React.CSSProperties
  nodeColor?: (node: any) => string
}

export const MiniMapPanel: React.FC<MiniMapPanelProps> = ({ style, nodeColor }) => {
  const nodes = useNodes()
  const { theme } = useTheme()
  const { fitView } = useReactFlow()
  
  // Create a unique key based on node count, node IDs, and theme to force MiniMap re-initialization
  const mapKey = `${theme}-${nodes.length}-${nodes.map(n => n.id).join(',')}`

  useEffect(() => {
    // Enforce explicit canvas layer clear-rect routines
    const canvases = document.querySelectorAll('.react-flow__minimap canvas')
    canvases.forEach((canvas) => {
      const ctx = (canvas as HTMLCanvasElement).getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, (canvas as HTMLCanvasElement).width, (canvas as HTMLCanvasElement).height)
      }
    })

    // Re-trigger viewport coordinate syncs on theme switches and file transitions
    const timer = setTimeout(() => {
      fitView({ duration: 0 })
    }, 50)
    return () => clearTimeout(timer)
  }, [theme, nodes.length, fitView])

  return (
    <MiniMap
      key={mapKey}
      style={{
        ...style,
        transform: 'translate3d(0, 0, 0)', // Enforce hardware-accelerated rendering layers
        willChange: 'transform'
      }}
      nodeColor={nodeColor}
    />
  )
}
