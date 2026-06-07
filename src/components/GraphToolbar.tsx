import React, { useState } from 'react'
import { Search, Maximize2, AlertTriangle, ChevronDown } from 'lucide-react'

interface GraphToolbarProps {
  filterQuery: string
  setFilterQuery: (val: string) => void
  showExternal: boolean
  setShowExternal: (val: boolean) => void
  showOnlyCycles: boolean
  setShowOnlyCycles: (val: boolean) => void
  cycleNodesCount: number
  availableExtensions: string[]
  selectedExtensions: string[]
  setSelectedExtensions: (exts: string[]) => void
  hasData: boolean
  setIsFullscreen: (val: boolean) => void
}

export const GraphToolbar: React.FC<GraphToolbarProps> = ({
  filterQuery,
  setFilterQuery,
  showExternal,
  setShowExternal,
  showOnlyCycles,
  setShowOnlyCycles,
  cycleNodesCount,
  availableExtensions,
  selectedExtensions,
  setSelectedExtensions,
  hasData,
  setIsFullscreen
}) => {
  const [isExtDropdownOpen, setIsExtDropdownOpen] = useState(false)
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 16px',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--panel-bg)',
        backdropFilter: 'blur(12px)',
        transition: 'background-color 0.3s, border-color 0.3s',
        position: 'relative',
        zIndex: 150,
        minWidth: 0
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', minWidth: 0, flexShrink: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--input-bg)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)', flexShrink: 0, minWidth: '160px' }}>
          <Search size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Filtrer..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--text)',
              fontSize: '12px',
              outline: 'none',
              width: '120px'
            }}
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0, minWidth: 'max-content' }}>
          <input
            type="checkbox"
            checked={showExternal}
            onChange={(e) => setShowExternal(e.target.checked)}
            style={{ cursor: 'pointer', flexShrink: 0 }}
          />
          <span>Packages externes</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0, minWidth: 'max-content' }}>
          <input
            type="checkbox"
            checked={showOnlyCycles}
            onChange={(e) => setShowOnlyCycles(e.target.checked)}
            style={{ cursor: 'pointer', flexShrink: 0 }}
          />
          <span style={{ color: showOnlyCycles ? 'var(--cycle)' : 'inherit' }}>Cycles uniquement</span>
        </label>

        {cycleNodesCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--cycle)', backgroundColor: 'var(--cycle-muted)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.3)', flexShrink: 0, minWidth: 'max-content' }}>
            <AlertTriangle size={11} color="var(--cycle)" style={{ flexShrink: 0 }} />
            <span>{cycleNodesCount} fichiers en cycle</span>
          </div>
        )}

        {availableExtensions.length > 0 && (
          <div style={{ position: 'relative', flexShrink: 0, minWidth: 'max-content' }} onMouseLeave={() => setIsExtDropdownOpen(false)}>
            <button
              onClick={() => setIsExtDropdownOpen(!isExtDropdownOpen)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text)',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background-color 0.2s, border-color 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-muted)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--input-bg)')}
            >
              <span>Extensions ({selectedExtensions.length})</span>
              <ChevronDown size={12} style={{ transform: isExtDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
            </button>

            {isExtDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  width: '160px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  backgroundColor: 'var(--dropdown-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px -5px var(--shadow)',
                  backdropFilter: 'blur(12px)',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 100
                }}
              >
                {availableExtensions.map((ext) => {
                  const isSelected = selectedExtensions.includes(ext)
                  return (
                    <label
                      key={ext}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: isSelected ? 'var(--text)' : 'var(--text-muted)',
                        backgroundColor: isSelected ? 'var(--accent-muted)' : 'transparent',
                        transition: 'background-color 0.15s',
                        userSelect: 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          if (isSelected) {
                            setSelectedExtensions(selectedExtensions.filter((e) => e !== ext))
                          } else {
                            setSelectedExtensions([...selectedExtensions, ext])
                          }
                        }}
                        style={{ cursor: 'pointer', flexShrink: 0 }}
                      />
                      <span>{ext}</span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {hasData && (
        <button
          onClick={() => setIsFullscreen(true)}
          style={{
            padding: '4px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--text)',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background-color 0.2s, border-color 0.2s',
            flexShrink: 0,
            minWidth: 'max-content'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-muted)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--input-bg)')}
        >
          <Maximize2 size={12} style={{ flexShrink: 0 }} />
          <span>Plein écran</span>
        </button>
      )}
    </div>
  )
}
