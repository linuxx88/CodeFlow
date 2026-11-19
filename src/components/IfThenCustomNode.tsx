import React, { useState } from 'react'
import { Handle } from '@xyflow/react'

export const IfThenCustomNode = React.memo(({ data, sourcePosition, targetPosition }: any) => {
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

  const highPerformance = data.highPerformanceMode

  return (
    <div
      style={{
        position: 'relative',
        filter: isCondition && !highPerformance ? `drop-shadow(0 8px 16px var(--shadow)) drop-shadow(0 0 8px ${glowColor})` : 'none',
        display: 'inline-block',
        width: isCondition
          ? (data.width ? `${data.width}px` : '200px')
          : (data.width ? `${Math.min(320, Math.max(180, data.width))}px` : undefined),
        height: isCondition ? (data.height ? `${data.height}px` : '110px') : 'auto',
        minWidth: isCondition ? '200px' : '180px',
        maxWidth: isCondition ? '360px' : '320px',
        boxSizing: 'border-box',
        transition: highPerformance ? 'none' : 'all 0.3s ease, opacity 0.3s ease',
        opacity: data.isDimmed ? 0.15 : 1
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
          padding: isCondition ? '22px 36px' : '12px 20px',
          borderRadius: isCondition ? '0px' : '10px',
          border: isCondition ? 'none' : `1.5px solid ${color}`,
          backgroundColor: isCondition ? 'transparent' : 'var(--panel-bg)',
          backdropFilter: isCondition || highPerformance ? 'none' : 'blur(16px)',
          color: 'var(--text)',
          fontSize: '13px',
          width: '100%',
          height: '100%',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
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
          <span>{isStart ? 'Start' : isCondition ? 'IF (Condition)' : 'THEN / ELSE'}</span>
          {!isStart && (
            <button
              aria-expanded={isExpanded}
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--border)',
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
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Details hidden</div>
        ) : (
          <div style={{ fontWeight: 600, wordBreak: 'break-word', overflowWrap: 'anywhere', maxWidth: '100%' }}>{data.label}</div>
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
            zIndex: 0
          }}
        >
          <polygon
            points="50,0.75 99.25,50 50,99.25 0.75,50"
            fill="var(--panel-bg)"
            stroke={color}
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
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
}, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.selected === nextProps.selected &&
    prevProps.sourcePosition === nextProps.sourcePosition &&
    prevProps.targetPosition === nextProps.targetPosition &&
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
  );
});

