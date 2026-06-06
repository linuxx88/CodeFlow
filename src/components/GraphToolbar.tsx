import React from 'react'
import { Search, Maximize2, AlertTriangle } from 'lucide-react'

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
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--panel-bg)',
        backdropFilter: 'blur(12px)',
        transition: 'background-color 0.3s, border-color 0.3s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--input-bg)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <Search size={13} color="var(--text-muted)" />
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

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: 'var(--text-muted)' }}>
          <input
            type="checkbox"
            checked={showExternal}
            onChange={(e) => setShowExternal(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <span>Packages externes</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: 'var(--text-muted)' }}>
          <input
            type="checkbox"
            checked={showOnlyCycles}
            onChange={(e) => setShowOnlyCycles(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <span style={{ color: showOnlyCycles ? 'var(--cycle)' : 'inherit' }}>Cycles uniquement</span>
        </label>

        {cycleNodesCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--cycle)', backgroundColor: 'var(--cycle-muted)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <AlertTriangle size={11} color="var(--cycle)" />
            <span>{cycleNodesCount} fichiers en cycle</span>
          </div>
        )}

        {availableExtensions.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderLeft: '1px solid var(--border)', paddingLeft: '12px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Exts :</span>
            {availableExtensions.map(ext => {
              const isSelected = selectedExtensions.includes(ext)
              return (
                <button
                  key={ext}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedExtensions(selectedExtensions.filter(e => e !== ext))
                    } else {
                      setSelectedExtensions([...selectedExtensions, ext])
                    }
                  }}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                    backgroundColor: isSelected ? 'var(--accent-muted)' : 'var(--input-bg)',
                    color: isSelected ? 'var(--text)' : 'var(--text-muted)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {ext}
                </button>
              )
            })}
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
            transition: 'background-color 0.2s, border-color 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-muted)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--input-bg)')}
        >
          <Maximize2 size={12} />
          <span>Plein écran</span>
        </button>
      )}
    </div>
  )
}
