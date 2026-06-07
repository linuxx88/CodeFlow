import React, { useEffect, useState } from 'react'
import { MiniMap, useReactFlow, useNodes } from '@xyflow/react'
import { useTheme } from '../hooks/useTheme'
import { Map, ChevronDown } from 'lucide-react'

interface MiniMapPanelProps {
  style?: React.CSSProperties
  nodeColor?: (node: any) => string
}

export const MiniMapPanel: React.FC<MiniMapPanelProps> = ({ style, nodeColor }) => {
  const nodes = useNodes()
  const { theme } = useTheme()
  const { fitView } = useReactFlow()
  const [isCollapsed, setIsCollapsed] = useState(false)
  
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
    <>
      <MiniMap
        key={mapKey}
        pannable
        style={{
          ...style,
          width: 200,
          height: 150,
          transform: isCollapsed 
            ? 'translate3d(40px, 40px, 0) scale(0)' 
            : 'translate3d(0, 0, 0) scale(1)',
          opacity: isCollapsed ? 0 : 1,
          pointerEvents: isCollapsed ? 'none' : 'all',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform, opacity'
        }}
        nodeColor={nodeColor}
      />
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          position: 'absolute',
          right: '16px',
          bottom: isCollapsed ? '16px' : '176px',
          zIndex: 1000,
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '1px solid var(--border)',
          backgroundColor: 'var(--panel-bg)',
          backdropFilter: 'blur(8px)',
          color: 'var(--text)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px var(--shadow)',
          transition: 'bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s, transform 0.2s',
        }}
        title={isCollapsed ? 'Afficher la MiniMap' : 'Masquer la MiniMap'}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--accent-muted)'
          e.currentTarget.style.transform = 'scale(1.05)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--panel-bg)'
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        {isCollapsed ? <Map size={16} /> : <ChevronDown size={16} />}
      </button>
    </>
  )
}
