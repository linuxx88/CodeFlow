import React, { useState, useMemo } from 'react'
import { FolderTree, Folder, FolderOpen, FileText, Search, X, FolderMinus, ChevronLeft, ChevronRight } from 'lucide-react'
import { fuzzyMatch, flattenFullTree } from '../utils/projectUtils'

interface ExplorerProps {
  structure?: any
  flatFiles: any[]
  onToggleDirectory: (path: string) => void
  onCollapseAll?: () => void
  gitStatuses?: Record<string, 'modified' | 'untracked' | 'added' | 'deleted' | 'renamed' | 'unmerged'>
  activeFile?: string | null
  onSelectFile?: (path: string) => void
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

const FileIcon = ({ name, color, size = 14 }: { name: string; color: string; size?: number }) => {
  const ext = name.substring(name.lastIndexOf('.')).toLowerCase()
  
  switch (ext) {
    case '.ts':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <rect width="16" height="16" rx="3" fill="#3178C6" />
          <text x="8" y="11.5" fill="white" fontSize="9" fontWeight="bold" fontFamily="'Outfit', sans-serif" textAnchor="middle">TS</text>
        </svg>
      )
    case '.tsx':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <rect width="16" height="16" rx="3" fill="#007ACC" />
          <text x="8" y="11" fill="white" fontSize="8" fontWeight="bold" fontFamily="'Outfit', sans-serif" textAnchor="middle">TSX</text>
        </svg>
      )
    case '.js':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <rect width="16" height="16" rx="3" fill="#F7DF1E" />
          <text x="8" y="11.5" fill="#000000" fontSize="9" fontWeight="bold" fontFamily="'Outfit', sans-serif" textAnchor="middle">JS</text>
        </svg>
      )
    case '.jsx':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <rect width="16" height="16" rx="3" fill="#F7DF1E" />
          <text x="8" y="11" fill="#000000" fontSize="8" fontWeight="bold" fontFamily="'Outfit', sans-serif" textAnchor="middle">JSX</text>
        </svg>
      )
    case '.py':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <rect width="16" height="16" rx="3" fill="#3776AB" />
          <text x="8" y="11.5" fill="#FFD43B" fontSize="9" fontWeight="bold" fontFamily="'Outfit', sans-serif" textAnchor="middle">PY</text>
        </svg>
      )
    case '.json':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <rect width="16" height="16" rx="3" fill="#A246C5" />
          <text x="8" y="11.5" fill="white" fontSize="9" fontWeight="bold" fontFamily="'Outfit', sans-serif" textAnchor="middle">{}</text>
        </svg>
      )
    case '.html':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <rect width="16" height="16" rx="3" fill="#E34F26" />
          <text x="8" y="11.5" fill="white" fontSize="8" fontWeight="bold" fontFamily="'Outfit', sans-serif" textAnchor="middle">&lt;&gt;</text>
        </svg>
      )
    case '.css':
    case '.scss':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <rect width="16" height="16" rx="3" fill="#1572B6" />
          <text x="8" y="11.5" fill="white" fontSize="8" fontWeight="bold" fontFamily="'Outfit', sans-serif" textAnchor="middle">#</text>
        </svg>
      )
    case '.md':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <rect width="16" height="16" rx="3" fill="#000000" style={{ stroke: 'var(--border)', strokeWidth: 1 }} />
          <text x="8" y="11.5" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="'Outfit', sans-serif" textAnchor="middle">MD</text>
        </svg>
      )
    default:
      return <FileText size={size} color={color} style={{ flexShrink: 0, transition: 'color 0.2s' }} />
  }
}

export const Explorer: React.FC<ExplorerProps> = ({
  structure,
  flatFiles,
  onToggleDirectory,
  onCollapseAll,
  gitStatuses = {},
  activeFile,
  onSelectFile
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev)
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 300)
  }

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
        width: isCollapsed ? '0px' : '280px',
        borderRight: isCollapsed ? 'none' : '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--panel-bg)',
        backdropFilter: 'blur(12px)',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s, border-color 0.3s',
        position: 'relative',
        height: '100%',
        flexShrink: 0,
        overflow: 'visible',
        zIndex: isCollapsed ? 1000 : 1
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '280px',
          opacity: isCollapsed ? 0 : 1,
          transition: 'opacity 0.2s',
          pointerEvents: isCollapsed ? 'none' : 'auto',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderTree size={16} color="var(--accent)" />
            <h2 style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', margin: 0 }}>
              Explorateur
            </h2>
          </div>
          {flatFiles.length > 0 && onCollapseAll && (
            <button
              onClick={onCollapseAll}
              title="Tout replier"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: '4px',
                transition: 'background-color 0.2s, color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-muted)'
                e.currentTarget.style.color = 'var(--text)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = 'var(--text-muted)'
              }}
            >
              <FolderMinus size={14} />
            </button>
          )}
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

              const isActive = activeFile === file.path

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (file.isDir) {
                      onToggleDirectory(file.path)
                    } else {
                      if (onSelectFile) {
                        onSelectFile(file.path)
                      }
                    }
                  }}
                  title={file.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginLeft: `${file.depth * 14}px`,
                    backgroundColor: isActive ? 'var(--accent-muted)' : 'transparent',
                    border: isActive ? '1px solid var(--accent)' : '1px solid transparent',
                    transition: 'background-color 0.2s',
                    userSelect: 'none',
                    minWidth: 0,
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'var(--accent-muted)'
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  {file.isDir ? (
                    isCollapsed ? (
                      <Folder size={15} color={iconColor} style={{ flexShrink: 0 }} />
                    ) : (
                      <FolderOpen size={15} color={iconColor} style={{ flexShrink: 0 }} />
                    )
                  ) : (
                    <FileIcon name={file.name} color={iconColor} size={15} />
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

      <button
        onClick={toggleCollapse}
        style={{
          position: 'absolute',
          top: '50%',
          right: isCollapsed ? '-20px' : '-12px',
          transform: 'translateY(-50%)',
          width: isCollapsed ? '20px' : '24px',
          height: isCollapsed ? '60px' : '24px',
          borderRadius: isCollapsed ? '0 8px 8px 0' : '50%',
          border: '1px solid var(--border)',
          borderLeft: isCollapsed ? 'none' : '1px solid var(--border)',
          backgroundColor: 'var(--panel-bg)',
          backdropFilter: 'blur(12px)',
          color: 'var(--text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '4px 0 10px rgba(0,0,0,0.2)',
          zIndex: 9999,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--accent-muted)'
          e.currentTarget.style.borderColor = 'var(--accent)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--panel-bg)'
          e.currentTarget.style.borderColor = 'var(--border)'
        }}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </div>
  )
}
