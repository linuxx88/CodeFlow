import React, { useState } from 'react'
import { Handle } from '@xyflow/react'

export const ClassCustomNode = React.memo(({ data, sourcePosition, targetPosition }: any) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const highPerformance = data.highPerformanceMode

  return (
    <div
      style={{
        borderRadius: '12px',
        border: '1.5px solid var(--accent)',
        backgroundColor: 'var(--panel-bg)',
        backdropFilter: highPerformance ? 'none' : 'blur(16px)',
        color: 'var(--text)',
        fontSize: '12px',
        minWidth: '240px',
        boxShadow: highPerformance ? 'none' : '0 8px 32px 0 var(--shadow), 0 0 14px var(--accent-glow)',
        textAlign: 'left',
        overflow: 'visible',
        position: 'relative',
        transition: highPerformance ? 'none' : 'all 0.3s ease, opacity 0.3s ease',
        opacity: data.isDimmed ? 0.15 : 1
      }}
    >
      <Handle
        type="target"
        position={targetPosition || 'top'}
        style={{
          background: 'var(--accent)',
          width: '8px',
          height: '8px',
          border: '1.5px solid var(--bg)',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      {/* Class Name Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '10px 14px',
          fontWeight: 'bold',
          backgroundColor: 'var(--input-bg)',
          borderBottom: isExpanded ? '1px solid var(--border)' : 'none',
          borderTopLeftRadius: '11px',
          borderTopRightRadius: '11px',
          borderBottomLeftRadius: isExpanded ? '0px' : '11px',
          borderBottomRightRadius: isExpanded ? '0px' : '11px',
          color: 'var(--accent)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <span style={{ fontSize: '13px', letterSpacing: '0.5px' }}>{data.name}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {data.inherits && (
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              hérite de {data.inherits}
            </span>
          )}
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            {isExpanded ? '▼' : '▲'}
          </span>
        </div>
      </div>

      {/* Scrollable Container Wrapper */}
      {isExpanded && (
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
                <div key={idx} style={{ fontFamily: 'monospace', color: 'var(--success)', fontSize: '11px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  <span style={{ color: 'var(--success)', marginRight: '6px' }}>+</span>
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
      )}

      <Handle
        type="source"
        position={sourcePosition || 'bottom'}
        style={{
          background: 'var(--accent)',
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

