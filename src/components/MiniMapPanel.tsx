import React, { useState } from 'react'
import { MiniMap } from '@xyflow/react'
import { Map, ChevronDown } from 'lucide-react'

interface MiniMapPanelProps {
  style?: React.CSSProperties
  nodeColor?: (node: any) => string
}

export const MiniMapPanel: React.FC<MiniMapPanelProps> = ({ style, nodeColor }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <>
      <MiniMap
        pannable
        zoomable
        bgColor="var(--dropdown-bg)"
        maskColor="color-mix(in srgb, var(--bg) 72%, transparent)"
        nodeStrokeColor="var(--border)"
        nodeBorderRadius={4}
        style={{
          backgroundColor: 'var(--dropdown-bg)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          boxShadow: '0 8px 24px var(--shadow)',
          ...style,
          zIndex: 50,
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
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? 'Show MiniMap' : 'Hide MiniMap'}
        aria-expanded={!isCollapsed}
        style={{
          position: 'absolute',
          right: '16px',
          bottom: isCollapsed ? '16px' : '176px',
          zIndex: 60,
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
        title={isCollapsed ? 'Show MiniMap' : 'Hide MiniMap'}
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
