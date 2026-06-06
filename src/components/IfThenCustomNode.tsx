import React from 'react'
import { Handle, Position } from '@xyflow/react'

export const IfThenCustomNode: React.FC<any> = ({ data, sourcePosition, targetPosition }) => {
  const isCondition = data.type === 'condition'
  const isStart = data.type === 'start'
  const color = isStart
    ? 'var(--accent)'
    : isCondition
    ? '#eab308'
    : '#10b981'

  const glowColor = isStart
    ? 'var(--accent-glow)'
    : isCondition
    ? 'rgba(234, 179, 8, 0.3)'
    : 'rgba(16, 185, 129, 0.3)'

  return (
    <div
      style={{
        position: 'relative',
        filter: isCondition ? `drop-shadow(0 8px 16px var(--shadow)) drop-shadow(0 0 8px ${glowColor})` : 'none',
        display: 'inline-block',
        minWidth: '180px',
        aspectRatio: isCondition ? '1 / 1' : 'auto'
      }}
    >
      <Handle
        type="target"
        position={targetPosition || Position.Top}
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
          padding: isCondition ? '30px' : '12px 20px',
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
            flexShrink: 0
          }}
        >
          {isStart ? 'Début' : isCondition ? 'SI (Condition)' : 'ALORS / SINON'}
        </div>
        <div style={{ fontWeight: 600, wordBreak: 'break-word', maxWidth: '100%' }}>{data.label}</div>
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
        position={sourcePosition || Position.Bottom}
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
