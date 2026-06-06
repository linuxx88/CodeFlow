import React from 'react'
import { Handle, Position } from '@xyflow/react'

export const IfThenCustomNode: React.FC<any> = ({ data }) => {
  const isCondition = data.type === 'condition'
  const isStart = data.type === 'start'
  const color = isStart
    ? 'var(--accent)'
    : isCondition
    ? '#eab308'
    : '#10b981'

  return (
    <div
      style={{
        padding: '12px 18px',
        borderRadius: '8px',
        border: `1px solid ${color}`,
        backgroundColor: 'var(--panel-bg)',
        backdropFilter: 'blur(12px)',
        color: 'var(--text)',
        fontSize: '13px',
        minWidth: '180px',
        boxShadow: '0 4px 20px var(--shadow)',
        textAlign: 'center',
        position: 'relative'
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: color, width: '8px', height: '8px' }} />
      <div
        style={{
          fontSize: '10px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          marginBottom: '4px',
          color: color
        }}
      >
        {isStart ? 'Début' : isCondition ? 'SI (Condition)' : 'ALORS / SINON'}
      </div>
      <div style={{ fontWeight: 500 }}>{data.label}</div>
      <Handle type="source" position={Position.Bottom} style={{ background: color, width: '8px', height: '8px' }} />
    </div>
  )
}

