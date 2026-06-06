import React from 'react'
import { FileText, RefreshCw } from 'lucide-react'
import { Handle, Position } from '@xyflow/react'

export const FileNode: React.FC<any> = ({ data }) => {
  const isBottleneck = data.isBottleneck
  const isPackage = data.isPackage
  const isPartOfCycle = data.isPartOfCycle
  
  let borderColor = 'var(--accent)'
  const bgColor = 'var(--panel-bg)'
  let textColor = 'var(--text)'
  let glowColor = 'var(--accent-glow)'
  
  if (isBottleneck) {
    borderColor = 'var(--bottleneck)'
    glowColor = 'rgba(244, 63, 94, 0.35)'
    textColor = '#fff'
  } else if (isPackage) {
    borderColor = 'var(--border)'
    glowColor = 'transparent'
    textColor = 'var(--text-muted)'
  }

  if (isPartOfCycle) {
    borderColor = 'var(--cycle)'
    glowColor = 'rgba(245, 158, 11, 0.35)'
  }

  return (
    <div
      style={{
        padding: '10px 18px',
        borderRadius: '10px',
        backgroundColor: bgColor,
        backdropFilter: 'blur(16px)',
        border: `1.5px solid ${borderColor}`,
        color: textColor,
        fontSize: '13px',
        fontFamily: 'monospace',
        whiteSpace: 'nowrap',
        boxShadow: `0 8px 32px 0 var(--shadow), 0 0 12px ${glowColor}`,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        opacity: data.isDimmed ? 0.25 : 1,
        transition: 'all 0.3s ease',
        position: 'relative'
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: borderColor,
          borderRadius: '50%',
          width: '8px',
          height: '8px',
          border: '1.5px solid var(--bg)'
        }}
      />
      {isPackage ? (
        <span style={{ fontSize: '10px', opacity: 0.7, fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)' }}>[pkg]</span>
      ) : (
        <FileText size={14} color={isPartOfCycle ? 'var(--cycle)' : (isBottleneck ? 'var(--bottleneck)' : 'var(--accent)')} />
      )}
      <span style={{ fontWeight: 500 }}>{data.label}</span>
      {isPartOfCycle && (
        <RefreshCw size={12} color="var(--cycle)" style={{ animation: 'spin 4s linear infinite', marginLeft: '4px' }} />
      )}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: borderColor,
          borderRadius: '50%',
          width: '8px',
          height: '8px',
          border: '1.5px solid var(--bg)'
        }}
      />
    </div>
  )
}

