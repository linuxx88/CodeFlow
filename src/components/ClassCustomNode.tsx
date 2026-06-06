import React from 'react'
import { Handle, Position } from '@xyflow/react'

export const ClassCustomNode: React.FC<any> = ({ data }) => {
  return (
    <div
      style={{
        borderRadius: '6px',
        border: '1px solid var(--accent)',
        backgroundColor: 'var(--panel-bg)',
        backdropFilter: 'blur(12px)',
        color: 'var(--text)',
        fontSize: '12px',
        minWidth: '220px',
        boxShadow: '0 4px 20px var(--shadow)',
        textAlign: 'left',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: 'var(--accent)', width: '8px', height: '8px' }} />
      {/* Class Name Header */}
      <div
        style={{
          padding: '8px 12px',
          fontWeight: 'bold',
          backgroundColor: 'var(--input-bg)',
          borderBottom: '1px solid var(--border)',
          color: 'var(--accent)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span>{data.name}</span>
        {data.inherits && (
          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
            extends {data.inherits}
          </span>
        )}
      </div>

      {/* Properties section */}
      <div style={{ padding: '6px 12px', borderBottom: '1px solid var(--border)' }}>
        {data.properties && data.properties.length > 0 ? (
          data.properties.map((prop: string, idx: number) => (
            <div key={idx} style={{ fontFamily: 'monospace', color: 'var(--text)', opacity: 0.9, fontSize: '11px' }}>
              + {prop}
            </div>
          ))
        ) : (
          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '10px' }}>
            Aucun attribut
          </div>
        )}
      </div>

      {/* Methods section */}
      <div style={{ padding: '6px 12px' }}>
        {data.methods && data.methods.length > 0 ? (
          data.methods.map((method: string, idx: number) => (
            <div key={idx} style={{ fontFamily: 'monospace', color: '#22c55e', fontSize: '11px' }}>
              + {method}()
            </div>
          ))
        ) : (
          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '10px' }}>
            Aucune méthode
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: 'var(--accent)', width: '8px', height: '8px' }} />
    </div>
  )
}

