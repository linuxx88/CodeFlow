import React, { useState } from 'react'
import { Handle } from '@xyflow/react'

export const IfThenCustomNode: React.FC<any> = ({ data, sourcePosition, targetPosition }) => {
  const isCondition = data.type === 'condition'
  const isStart = data.type === 'start'
  const color = isStart
    ? 'var(--accent)'
    : isCondition
    ? 'var(--warning)'
    : 'var(--success)'

  const glowColor = isStart
    ? 'var(--accent-glow)'
    : `color-mix(in srgb, ${color} 30%, transparent)`

  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div
      style={{
        position: 'relative',
        filter: isCondition ? `drop-shadow(0 8px 16px var(--shadow)) drop-shadow(0 0 8px ${glowColor})` : 'none',
        display: 'inline-block',
        width: isCondition && data.width ? `${data.width}px` : 'auto',
        height: isCondition && data.height ? `${data.height}px` : 'auto',
        minWidth: isCondition ? 'auto' : '180px',
      }}
    >
      <Handle
        type="target"
        position={targetPosition || 'top'}
        style={{
          background: color,
          width: '8px',
          height: '8px',
          border: '1.5px solid var(--bg)',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      <div
        style={{
          padding: isCondition ? '10px 24px' : '12px 20px',
          borderRadius: isCondition ? '0px' : '10px',
          border: isCondition ? 'none' : `1.5px solid ${color}`,
          backgroundColor: 'var(--panel-bg)',
          backdropFilter: 'blur(16px)',
          clipPath: isCondition ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' : 'none',
          color: 'var(--text)',
          fontSize: '13px',
          width: '100%',
          height: '100%',
          textAlign: 'center',
          position: 'relative',
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            fontSize: '9px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            marginBottom: '6px',
            color: color,
            letterSpacing: '1px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>{isStart ? 'Début' : isCondition ? 'SI (Condition)' : 'ALORS / SINON'}</span>
          {!isStart && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: color,
                cursor: 'pointer',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '8px',
                fontWeight: 'bold',
                outline: 'none',
                pointerEvents: 'all'
              }}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          )}
        </div>
        {!isStart && !isExpanded ? (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Détails masqués</div>
        ) : (
          <div style={{ fontWeight: 600, wordBreak: 'break-word', maxWidth: '100%' }}>{data.label}</div>
        )}
      </div>
      {isCondition && (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            transform: 'translate3d(0, 0, 0)',
            zIndex: 2
          }}
        >
          <polygon
            points="50,0.75 99.25,50 50,99.25 0.75,50"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
          />
        </svg>
      )}
      <Handle
        type="source"
        position={sourcePosition || 'bottom'}
        style={{
          background: color,
          width: '8px',
          height: '8px',
          border: '1.5px solid var(--bg)',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
    </div>
  )
}
