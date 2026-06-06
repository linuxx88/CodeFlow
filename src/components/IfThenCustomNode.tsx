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
        padding: '12px 20px',
        borderRadius: '10px',
        border: `1.5px solid ${color}`,
        backgroundColor: 'var(--panel-bg)',
        backdropFilter: 'blur(16px)',
        color: 'var(--text)',
        fontSize: '13px',
        minWidth: '180px',
        boxShadow: `0 8px 32px 0 var(--shadow), 0 0 12px ${glowColor}`,
        textAlign: 'center',
        position: 'relative',
        transition: 'all 0.3s ease'
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
          borderRadius: '50%'
        }}
      />
      <div
        style={{
          fontSize: '9px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          marginBottom: '6px',
          color: color,
          letterSpacing: '1px'
        }}
      >
        {isStart ? 'Début' : isCondition ? 'SI (Condition)' : 'ALORS / SINON'}
      </div>
      <div style={{ fontWeight: 600 }}>{data.label}</div>
      <Handle
        type="source"
        position={sourcePosition || Position.Bottom}
        style={{
          background: color,
          width: '8px',
          height: '8px',
          border: '1.5px solid var(--bg)',
          borderRadius: '50%'
        }}
      />
    </div>
  )
}

