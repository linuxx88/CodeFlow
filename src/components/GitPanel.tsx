import React from 'react'
import { Activity, AlertTriangle } from 'lucide-react'

interface GitPanelProps {
  isGitRepo: boolean
  hasGitData: boolean
  gitSortBy: 'score' | 'commits' | 'authors'
  setGitSortBy: (val: 'score' | 'commits' | 'authors') => void
  sortedGitHotspots: any[]
}

export const GitPanel: React.FC<GitPanelProps> = ({
  isGitRepo,
  hasGitData,
  gitSortBy,
  setGitSortBy,
  sortedGitHotspots
}) => {
  return (
    <div
      style={{
        width: '320px',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--panel-bg)',
        backdropFilter: 'blur(12px)',
        transition: 'background-color 0.3s, border-color 0.3s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
        <Activity size={16} color="var(--bottleneck)" />
        <h2 style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', margin: 0 }}>
          Friction Git / Hotspots
        </h2>
      </div>

      {hasGitData && isGitRepo && (
        <div style={{ display: 'flex', padding: '10px 16px', gap: '6px', borderBottom: '1px solid var(--border)' }}>
          {(['score', 'commits', 'authors'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setGitSortBy(mode)}
              style={{
                flex: 1,
                padding: '4px 8px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: gitSortBy === mode ? 'var(--accent)' : 'var(--input-bg)',
                color: gitSortBy === mode ? '#fff' : 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s, color 0.2s'
              }}
            >
              {mode === 'score' ? 'Score' : mode === 'commits' ? 'Modifications' : 'Auteurs'}
            </button>
          ))}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {hasGitData ? (
          isGitRepo ? (
            sortedGitHotspots.length > 0 ? (
              sortedGitHotspots.map((item, idx) => (
                <div
                   key={idx}
                   style={{
                     padding: '10px',
                     borderRadius: '8px',
                     backgroundColor: 'var(--input-bg)',
                     border: '1px solid var(--border)',
                     display: 'flex',
                     flexDirection: 'column',
                     gap: '6px',
                     transition: 'background-color 0.2s, border-color 0.2s'
                   }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }} title={item.file}>
                      {item.file}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--bottleneck)' }}>
                      {item.score}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', backgroundColor: 'var(--accent-muted)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                      {item.commits} modifs
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', backgroundColor: 'var(--package-muted)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                      {item.authors} aut.
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <div style={{ flex: 1, height: '4px', backgroundColor: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: `${item.percentage}%`, height: '100%', backgroundColor: 'var(--bottleneck)', borderRadius: '99px' }}></div>
                    </div>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', width: '24px', textAlign: 'right' }}>
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
                <Activity size={28} style={{ opacity: 0.5 }} />
                <span style={{ fontSize: '12px' }}>Aucun fichier suivi dans le dépôt Git.</span>
              </div>
            )
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px', color: 'var(--bottleneck)', textAlign: 'center', padding: '16px' }}>
              <AlertTriangle size={28} style={{ opacity: 0.8 }} />
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Dépôt Git non détecté.</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Initialisez Git pour suivre la friction des fichiers.</span>
            </div>
          )
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
            <Activity size={28} style={{ opacity: 0.5 }} />
            <span style={{ fontSize: '12px' }}>Scannez le projet pour analyser l'historique de friction Git.</span>
          </div>
        )}
      </div>
    </div>
  )
}
