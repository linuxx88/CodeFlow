import React from 'react'
import { Handle, Position } from '@xyflow/react'

export const ClassCustomNode: React.FC<any> = ({ data, sourcePosition, targetPosition }) => {
  return (
    <div
      style={{
        borderRadius: '12px',
        border: '1.5px solid var(--accent)',
        backgroundColor: 'var(--panel-bg)',
        backdropFilter: 'blur(16px)',
        color: 'var(--text)',
        fontSize: '12px',
        minWidth: '240px',
        boxShadow: '0 8px 32px 0 var(--shadow), 0 0 14px var(--accent-glow)',
        textAlign: 'left',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.3s ease'
      }}
    >
      <Handle
        type="target"
        position={targetPosition || Position.Top}
        style={{
          background: 'var(--accent)',
          width: '8px',
          height: '8px',
          border: '1.5px solid var(--bg)',
          borderRadius: '50%'
        }}
      />
      {/* Class Name Header */}
      <div
        style={{
          padding: '10px 14px',
          fontWeight: 'bold',
          backgroundColor: 'var(--input-bg)',
          borderBottom: '1px solid var(--border)',
          color: 'var(--accent)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span style={{ fontSize: '13px', letterSpacing: '0.5px' }}>{data.name}</span>
        {data.inherits && (
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            extends {data.inherits}
          </span>
        )}
      </div>

      {/* Scrollable Container Wrapper */}
      <div
        style={{
          maxHeight: '200px',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        {/* Properties section */}
        <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {data.properties && data.properties.length > 0 ? (
            data.properties.map((prop: string, idx: number) => (
              <div key={idx} style={{ fontFamily: 'monospace', color: 'var(--text)', opacity: 0.9, fontSize: '11px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                <span style={{ color: 'var(--accent)', marginRight: '6px' }}>+</span>
                {prop}
              </div>
            ))
          ) : (
            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '10px' }}>
              Aucun attribut
            </div>
          )}
        </div>

        {/* Methods section */}
        <div style={{ padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {data.methods && data.methods.length > 0 ? (
            data.methods.map((method: string, idx: number) => (
              <div key={idx} style={{ fontFamily: 'monospace', color: '#10b981', fontSize: '11px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                <span style={{ color: '#10b981', marginRight: '6px' }}>+</span>
                {method}()
              </div>
            ))
          ) : (
            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '10px' }}>
              Aucune méthode
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={sourcePosition || Position.Bottom}
        style={{
          background: 'var(--accent)',
          width: '8px',
          height: '8px',
          border: '1.5px solid var(--bg)',
          borderRadius: '50%'
        }}
      />
    </div>
  )
}
