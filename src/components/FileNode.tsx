import React from 'react'
import { FileText, RefreshCw } from 'lucide-react'
import { Handle, Position } from '@xyflow/react'

export const FileNode: React.FC<any> = ({ data }) => {
  const isBottleneck = data.isBottleneck
  const isPackage = data.isPackage
  const isPartOfCycle = data.isPartOfCycle
  
  let borderColor = 'var(--accent)'
  let bgColor = 'var(--accent-muted)'
  let textColor = 'var(--text)'
  
  if (isBottleneck) {
    borderColor = 'var(--bottleneck)'
    bgColor = 'var(--bottleneck-muted)'
    textColor = '#fff'
  } else if (isPackage) {
    borderColor = 'rgba(255,255,255,0.15)'
    bgColor = 'var(--package-muted)'
    textColor = 'var(--text-muted)'
  }

  if (isPartOfCycle) {
    borderColor = 'var(--cycle)'
    bgColor = 'var(--cycle-muted)'
  }

  return (
    <div
      style={{
        padding: '10px 16px',
        borderRadius: '8px',
        backgroundColor: bgColor,
        border: `1.5px solid ${borderColor}`,
        color: textColor,
        fontSize: '13px',
        fontFamily: 'monospace',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        opacity: data.isDimmed ? 0.25 : 1,
        transition: 'opacity 0.2s, border-color 0.2s',
        position: 'relative'
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: borderColor, borderRadius: '50%', width: '8px', height: '8px' }} />
      {isPackage ? (
        <span style={{ fontSize: '10px', opacity: 0.6 }}>[pkg]</span>
      ) : (
        <FileText size={14} color={isPartOfCycle ? 'var(--cycle)' : (isBottleneck ? 'var(--bottleneck)' : 'var(--accent)')} />
      )}
      <span>{data.label}</span>
      {isPartOfCycle && (
        <RefreshCw size={12} color="var(--cycle)" style={{ animation: 'spin 4s linear infinite', marginLeft: '4px' }} />
      )}
      <Handle type="source" position={Position.Right} style={{ background: borderColor, borderRadius: '50%', width: '8px', height: '8px' }} />
    </div>
  )
}

