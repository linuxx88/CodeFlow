import React, { useState } from 'react'
import { ArrowRight, ArrowDown, SlidersHorizontal } from 'lucide-react'

interface LayoutToolbarProps {
  direction: 'LR' | 'TB'
  setDirection: (dir: 'LR' | 'TB') => void
  nodesep: number
  setNodesep: (sep: number) => void
  ranksep: number
  setRanksep: (sep: number) => void
  style?: React.CSSProperties
}

export const LayoutToolbar: React.FC<LayoutToolbarProps> = ({
  direction,
  setDirection,
  nodesep,
  setNodesep,
  ranksep,
  setRanksep,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '8px',
        ...style,
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          border: '1.5px solid var(--border)',
          backgroundColor: isOpen ? 'var(--accent)' : 'var(--panel-bg)',
          backdropFilter: 'blur(16px)',
          color: isOpen ? '#fff' : 'var(--text)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px 0 var(--shadow)',
          transition: 'all 0.2s ease',
        }}
        title="Options de disposition"
      >
        <SlidersHorizontal size={16} />
      </button>

      {/* Dropdown Options Card */}
      {isOpen && (
        <div
          style={{
            backgroundColor: 'var(--panel-bg)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '14px 16px',
            boxShadow: '0 8px 32px 0 var(--shadow), 0 0 10px var(--accent-glow)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '240px',
            color: 'var(--text)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <span>Disposition du graphe</span>
          </div>

          {/* Direction Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Orientation</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setDirection('LR')}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: direction === 'LR' ? '1px solid var(--accent)' : '1px solid var(--border)',
                  backgroundColor: direction === 'LR' ? 'var(--accent-muted)' : 'var(--input-bg)',
                  color: direction === 'LR' ? 'var(--text)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontWeight: direction === 'LR' ? 600 : 400,
                  transition: 'all 0.2s',
                }}
              >
                <ArrowRight size={12} />
                <span>L-R</span>
              </button>
              <button
                onClick={() => setDirection('TB')}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: direction === 'TB' ? '1px solid var(--accent)' : '1px solid var(--border)',
                  backgroundColor: direction === 'TB' ? 'var(--accent-muted)' : 'var(--input-bg)',
                  color: direction === 'TB' ? 'var(--text)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontWeight: direction === 'TB' ? 600 : 400,
                  transition: 'all 0.2s',
                }}
              >
                <ArrowDown size={12} />
                <span>T-B</span>
              </button>
            </div>
          </div>

          {/* Node Spacing Slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>Espacement nœuds</span>
              <span>{nodesep}px</span>
            </div>
            <input
              type="range"
              min="20"
              max="150"
              value={nodesep}
              onChange={(e) => setNodesep(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: 'var(--accent)',
                cursor: 'pointer',
                height: '4px',
                borderRadius: '2px',
                backgroundColor: 'var(--border)',
              }}
            />
          </div>

          {/* Rank/Level Spacing Slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>Espacement niveaux</span>
              <span>{ranksep}px</span>
            </div>
            <input
              type="range"
              min="20"
              max="150"
              value={ranksep}
              onChange={(e) => setRanksep(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: 'var(--accent)',
                cursor: 'pointer',
                height: '4px',
                borderRadius: '2px',
                backgroundColor: 'var(--border)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
