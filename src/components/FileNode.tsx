import React from 'react'
import { FileText, RefreshCw } from 'lucide-react'
import { Handle, Position } from '@xyflow/react'

export const FileNode = React.memo(({ data, sourcePosition, targetPosition }: any) => {
  const isBottleneck = data.isBottleneck
  const isPackage = data.isPackage
  const isPartOfCycle = data.isPartOfCycle

  let borderColor = 'var(--accent)'
  const bgColor = 'var(--panel-bg)'
  let textColor = 'var(--text)'
  let glowColor = 'var(--accent-glow)'

  if (isBottleneck) {
    borderColor = 'var(--bottleneck)'
    glowColor = 'var(--bottleneck-muted)'
    textColor = 'var(--text)'
  } else if (isPackage) {
    borderColor = 'var(--border)'
    glowColor = 'transparent'
    textColor = 'var(--text-muted)'
  }

  if (isPartOfCycle) {
    borderColor = 'var(--cycle)'
    glowColor = 'var(--cycle-muted)'
  }

  const highPerformance = data.highPerformanceMode
  const rawLabel = String(data.fullPath || data.label || '')
  const normalized = rawLabel.replace(/\\/g, '/')
  const lastSlash = normalized.lastIndexOf('/')
  const derivedFileName = data.fileName || (lastSlash >= 0 ? normalized.slice(lastSlash + 1) : normalized)
  const derivedFolderPath = data.folderPath !== undefined
    ? data.folderPath
    : (lastSlash >= 0 ? normalized.slice(0, lastSlash) : '')
  const inDegree: number | undefined = typeof data.inDegree === 'number' ? data.inDegree : undefined

  return (
    <div
      title={rawLabel}
      style={{
        padding: '8px 12px',
        borderRadius: '10px',
        backgroundColor: bgColor,
        backdropFilter: highPerformance ? 'none' : 'blur(16px)',
        border: `1.5px solid ${borderColor}`,
        color: textColor,
        fontSize: '12px',
        fontFamily: "'Inter', system-ui, sans-serif",
        boxShadow: highPerformance ? 'none' : `0 6px 20px 0 var(--shadow), 0 0 10px ${glowColor}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '3px',
        opacity: data.isDimmed ? 0.2 : 1,
        transition: highPerformance ? 'opacity 0.2s ease' : 'all 0.25s ease',
        position: 'relative',
        width: data.width ? `${Math.min(280, Math.max(180, data.width))}px` : undefined,
        minWidth: '180px',
        maxWidth: '280px',
        minHeight: derivedFolderPath ? '54px' : '42px',
        boxSizing: 'border-box'
      }}
    >
      <Handle
        type="target"
        position={targetPosition || Position.Left}
        style={{
          background: borderColor,
          borderRadius: '50%',
          width: '8px',
          height: '8px',
          border: '1.5px solid var(--bg)',
          flexShrink: 0
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
        {isPackage ? (
          <span style={{ fontSize: '9px', opacity: 0.75, fontWeight: 700, textTransform: 'uppercase', color: 'var(--package)', flexShrink: 0 }}>
            [pkg]
          </span>
        ) : (
          <FileText size={13} color={isPartOfCycle ? 'var(--cycle)' : (isBottleneck ? 'var(--bottleneck)' : 'var(--accent)')} style={{ flexShrink: 0 }} />
        )}

        <span
          style={{
            fontWeight: 600,
            fontFamily: 'monospace',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            minWidth: 0,
            flex: 1
          }}
        >
          {derivedFileName}
        </span>

        {isPartOfCycle && (
          <RefreshCw size={11} color="var(--cycle)" style={{ animation: 'spin 4s linear infinite', flexShrink: 0 }} />
        )}

        {inDegree !== undefined && (
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              fontFamily: 'monospace',
              padding: '1px 6px',
              borderRadius: '999px',
              backgroundColor: isBottleneck ? 'var(--bottleneck-muted)' : 'var(--accent-muted)',
              color: isBottleneck ? 'var(--bottleneck)' : 'var(--text-muted)',
              border: `1px solid ${isBottleneck ? 'var(--bottleneck)' : 'var(--border)'}`,
              flexShrink: 0,
              whiteSpace: 'nowrap'
            }}
          >
            {inDegree} in
          </span>
        )}
      </div>

      {derivedFolderPath && (
        <div
          style={{
            fontSize: '10px',
            fontFamily: 'monospace',
            color: 'var(--text-muted)',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            paddingLeft: '20px',
            opacity: 0.85
          }}
        >
          {derivedFolderPath}
        </div>
      )}

      <Handle
        type="source"
        position={sourcePosition || Position.Right}
        style={{
          background: borderColor,
          borderRadius: '50%',
          width: '8px',
          height: '8px',
          border: '1.5px solid var(--bg)',
          flexShrink: 0
        }}
      />
    </div>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.selected === nextProps.selected &&
    prevProps.sourcePosition === nextProps.sourcePosition &&
    prevProps.targetPosition === nextProps.targetPosition &&
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
  )
})
