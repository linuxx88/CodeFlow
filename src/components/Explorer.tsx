import React, { useState, useMemo } from 'react'
import { FolderTree, Folder, FolderOpen, FileText, Search, X } from 'lucide-react'
import { fuzzyMatch, flattenFullTree } from '../utils/projectUtils'

interface ExplorerProps {
  structure?: any
  flatFiles: any[]
  onToggleDirectory: (path: string) => void
  gitStatuses?: Record<string, 'modified' | 'untracked' | 'added' | 'deleted' | 'renamed' | 'unmerged'>
}

const getGitStatusStyles = (status?: string) => {
  switch (status) {
    case 'modified':
      return {
        color: 'var(--warning)',
        badgeText: 'M',
        badgeBg: 'rgba(234, 179, 8, 0.12)',
        badgeColor: 'var(--warning)',
        label: 'Modifié'
      }
    case 'untracked':
      return {
        color: '#60a5fa',
        badgeText: 'U',
        badgeBg: 'rgba(96, 165, 250, 0.12)',
        badgeColor: '#60a5fa',
        label: 'Non suivi'
      }
    case 'added':
      return {
        color: 'var(--success)',
        badgeText: 'A',
        badgeBg: 'rgba(16, 185, 129, 0.12)',
        badgeColor: 'var(--success)',
        label: 'Ajouté'
      }
    case 'deleted':
      return {
        color: 'var(--bottleneck)',
        badgeText: 'D',
        badgeBg: 'rgba(244, 63, 94, 0.12)',
        badgeColor: 'var(--bottleneck)',
        label: 'Supprimé'
      }
    case 'renamed':
      return {
        color: 'var(--accent)',
        badgeText: 'R',
        badgeBg: 'var(--accent-muted)',
        badgeColor: 'var(--accent)',
        label: 'Renommé'
      }
    case 'unmerged':
      return {
        color: 'var(--bottleneck)',
        badgeText: '!',
        badgeBg: 'rgba(244, 63, 94, 0.2)',
        badgeColor: 'var(--bottleneck)',
        label: 'Conflit'
      }
    default:
      return null
  }
}

export const Explorer: React.FC<ExplorerProps> = ({
  structure,
  flatFiles,
  onToggleDirectory,
  gitStatuses = {}
}) => {
  const [searchQuery, setSearchQuery] = useState('')

  const itemsToRender = useMemo(() => {
    if (!searchQuery.trim() || !structure) {
      return flatFiles
    }

    const query = searchQuery.toLowerCase().trim()
    const allItems = flattenFullTree(structure)

    const visiblePaths = new Set<string>()

    const matches = allItems.filter(item => {
      return fuzzyMatch(item.name, query) || fuzzyMatch(item.path, query)
    })

    for (const item of matches) {
      visiblePaths.add(item.path)
      
      const parts = item.path.split('/')
      for (let i = 1; i < parts.length; i++) {
        visiblePaths.add(parts.slice(0, i).join('/'))
      }
    }

    return allItems.filter(item => visiblePaths.has(item.path))
  }, [structure, flatFiles, searchQuery])

  return (
    <div
      style={{
        width: '280px',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--panel-bg)',
        backdropFilter: 'blur(12px)',
        transition: 'background-color 0.3s, border-color 0.3s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <FolderTree size={16} color="var(--accent)" />
        <h2 style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', margin: 0 }}>
          Explorateur
        </h2>
      </div>

      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', flexShrink: 0 }}>
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px' }} />
          <input
            type="text"
            placeholder="Filtrer les fichiers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px 6px 30px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--input-bg)',
              color: 'var(--text)',
              fontSize: '12px',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)'
              e.currentTarget.style.boxShadow = '0 0 0 2px var(--accent-glow)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '8px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
                opacity: 0.7,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>
      
      <div
        style={{
          flex: 1,
          overflowX: 'hidden',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          padding: '12px'
        }}
      >
        {itemsToRender.length > 0 ? (
          itemsToRender.map((file, idx) => {
            const gitStatus = !file.isDir ? gitStatuses[file.path] : undefined
            const gitStatusStyles = getGitStatusStyles(gitStatus)
            
            const iconColor = file.isDir
              ? 'var(--accent)'
              : (gitStatusStyles ? gitStatusStyles.color : 'var(--text-muted)')
              
            const isCollapsed = file.isCollapsed

            return (
              <div
                key={idx}
                onClick={() => file.isDir && onToggleDirectory(file.path)}
                title={file.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  cursor: file.isDir ? 'pointer' : 'default',
                  marginLeft: `${file.depth * 14}px`,
                  backgroundColor: 'transparent',
                  transition: 'background-color 0.2s',
                  userSelect: 'none',
                  minWidth: 0,
                  flexShrink: 0
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-muted)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {file.isDir ? (
                  isCollapsed ? (
                    <Folder size={15} color={iconColor} style={{ flexShrink: 0 }} />
                  ) : (
                    <FolderOpen size={15} color={iconColor} style={{ flexShrink: 0 }} />
                  )
                ) : (
                  <FileText size={14} color={iconColor} style={{ flexShrink: 0, transition: 'color 0.2s' }} />
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: '13px',
                      color: gitStatusStyles ? gitStatusStyles.color : 'var(--text)',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      minWidth: 0,
                      transition: 'color 0.2s'
                    }}
                  >
                    {file.name}
                  </span>
                  {gitStatusStyles && (
                    <span
                      title={gitStatusStyles.label}
                      style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: '4px',
                        backgroundColor: gitStatusStyles.badgeBg,
                        color: gitStatusStyles.badgeColor,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1,
                        border: `1px solid ${gitStatusStyles.badgeColor}22`,
                        flexShrink: 0,
                        transform: 'scale(0.9)',
                        cursor: 'help',
                        transition: 'all 0.2s'
                      }}
                    >
                      {gitStatusStyles.badgeText}
                    </span>
                  )}
                </div>
                {file.sizeStr && (
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0 }}>
                    {file.sizeStr}
                  </span>
                )}
              </div>
            )
          })
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px', color: 'var(--text-muted)' }}>
            <FolderTree size={28} style={{ opacity: 0.5 }} />
            <span style={{ fontSize: '12px' }}>{searchQuery ? 'Aucun fichier ne correspond.' : 'Aucun scan actif.'}</span>
          </div>
        )}
      </div>
    </div>
  )
}
