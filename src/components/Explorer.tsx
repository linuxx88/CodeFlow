import React from 'react'
import { FolderTree, Folder, FolderOpen, FileText } from 'lucide-react'

interface ExplorerProps {
  flatFiles: any[]
  onToggleDirectory: (path: string) => void
}

export const Explorer: React.FC<ExplorerProps> = ({
  flatFiles,
  onToggleDirectory
}) => {
  return (
    <div
      style={{
        width: '280px',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(10, 10, 15, 0.4)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
        <FolderTree size={16} color="var(--accent)" />
        <h2 style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', margin: 0 }}>
          Explorateur
        </h2>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {flatFiles.length > 0 ? (
          flatFiles.map((file, idx) => {
            const iconColor = file.isDir ? 'var(--accent)' : 'var(--text-muted)'
            const isCollapsed = file.isCollapsed

            return (
              <div
                key={idx}
                onClick={() => file.isDir && onToggleDirectory(file.path)}
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
                  userSelect: 'none'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {file.isDir ? (
                  isCollapsed ? <Folder size={15} color={iconColor} /> : <FolderOpen size={15} color={iconColor} />
                ) : (
                  <FileText size={14} color={iconColor} />
                )}
                <span style={{ fontSize: '13px', color: '#e4e4e7', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}>
                  {file.name}
                </span>
                {file.sizeStr && (
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{file.sizeStr}</span>
                )}
              </div>
            )
          })
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px', color: 'var(--text-muted)' }}>
            <FolderTree size={28} style={{ opacity: 0.5 }} />
            <span style={{ fontSize: '12px' }}>Aucun scan actif.</span>
          </div>
        )}
      </div>
    </div>
  )
}
