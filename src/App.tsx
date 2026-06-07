import { useState, useMemo, useEffect } from 'react'
import {
  ReactFlow,
  Background
} from '@xyflow/react'
import {
  Search,
  AlertTriangle,
  ArrowLeft,
  ChevronDown
} from 'lucide-react'

import { Navbar } from './components/Navbar'
import { Explorer } from './components/Explorer'
import { GraphPanel } from './components/GraphPanel'
import { GitPanel } from './components/GitPanel'
import { FileNode } from './components/FileNode'
import { FlowchartRenderer } from './components/FlowchartRenderer'
import { LayoutToolbar } from './components/LayoutToolbar'
import { flattenTree, checkIsWebProject } from './utils/projectUtils'
import { useDependencyGraph } from './hooks/useDependencyGraph'
import { useTheme } from './hooks/useTheme'
import type { FlowchartView } from './constants/views'
import { MiniMapPanel } from './components/MiniMapPanel'
import { ControlsOverlay } from './components/ControlsOverlay'
import { useProjectScanner } from './hooks/useProjectScanner'
import { ToastContainer } from './components/ToastContainer'


const nodeTypes = {
  custom: FileNode
}

function App() {
  const { theme, setTheme } = useTheme()
  const [collapsedDirs, setCollapsedDirs] = useState<Record<string, boolean>>({})

  const [filterQuery, setFilterQuery] = useState('')
  const [showExternal, setShowExternal] = useState(false)
  const [showOnlyCycles, setShowOnlyCycles] = useState(false)
  const [selectedExtensions, setSelectedExtensions] = useState<string[]>([])
  const [forceDisplay, setForceDisplay] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isExtDropdownOpen, setIsExtDropdownOpen] = useState(false)
  const [gitSortBy, setGitSortBy] = useState<'score' | 'commits' | 'authors'>('score')
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<FlowchartView>('all')
  const [activeFile, setActiveFile] = useState<string | null>(null)

  const {
    projectPath,
    setProjectPath,
    isScanning,
    scanProgress,
    scanData,
    scanProject,
    cancelScan,
    scanError,
    setScanError
  } = useProjectScanner({
    onScanStart: () => {
      setForceDisplay(false)
      setFilterQuery('')
      setSelectedExtensions([])
    }
  })

  useEffect(() => {
    if (scanError) {
      const timer = setTimeout(() => {
        setScanError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [scanError, setScanError])

  const [direction, setDirection] = useState<'LR' | 'TB'>('LR')
  const [nodesep, setNodesep] = useState<number>(40)
  const [ranksep, setRanksep] = useState<number>(80)

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    totalVisibleNodesCount,
    cycles
  } = useDependencyGraph({
    scanData,
    showExternal,
    filterQuery,
    showOnlyCycles,
    selectedExtensions,
    hoveredNodeId,
    currentView,
    direction,
    nodesep,
    ranksep,
    activeFile
  })

  const availableExtensions = useMemo(() => {
    if (!scanData?.dependencies?.nodes) return []
    const exts = new Set<string>()
    scanData.dependencies.nodes.forEach((n: any) => {
      if (n.type === 'file') {
        const ext = n.id.substring(n.id.lastIndexOf('.')).toLowerCase()
        if (ext && ext.startsWith('.')) {
          exts.add(ext)
        }
      }
    })
    return Array.from(exts).sort()
  }, [scanData])

  const isWebProject = useMemo(() => {
    return checkIsWebProject(scanData)
  }, [scanData])

  const isWebWarning = currentView === 'web' && !isWebProject && !!scanData
  
  const flatFiles = useMemo(() => {
    if (scanData?.structure) {
      return flattenTree(scanData.structure, collapsedDirs)
    }
    return []
  }, [scanData, collapsedDirs])

  const toggleDirectory = (path: string) => {
    setCollapsedDirs(prev => ({
      ...prev,
      [path]: !prev[path]
    }))
  }

  const collapseAll = () => {
    if (!scanData?.structure) return
    const newCollapsed: Record<string, boolean> = {}
    const recurse = (node: any) => {
      if (node.type === 'directory') {
        const path = node.relative_path || ''
        if (path) {
          newCollapsed[path] = true
        }
        if (node.children) {
          node.children.forEach(recurse)
        }
      }
    }
    recurse(scanData.structure)
    setCollapsedDirs(newCollapsed)
  }

  const showWarning = totalVisibleNodesCount > 100 && !forceDisplay

  const sortedGitHotspots = useMemo(() => {
    if (!scanData?.git?.hotspots) return []
    const hotspots = [...scanData.git.hotspots]
    const maxScore = Math.max(...hotspots.map(h => h.score), 1)
    
    const formatted = hotspots.map(h => ({
      ...h,
      percentage: Math.round((h.score / maxScore) * 100)
    }))

    if (gitSortBy === 'commits') {
      return formatted.sort((a, b) => b.commits - a.commits || b.score - a.score)
    } else if (gitSortBy === 'authors') {
      return formatted.sort((a, b) => b.authors - a.authors || b.score - a.score)
    } else {
      return formatted.sort((a, b) => b.score - a.score || b.commits - a.commits)
    }
  }, [scanData, gitSortBy])

  return (
    <div className={`theme-${theme}`} style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', backgroundColor: 'var(--bg)', overflow: 'visible' }}>
      <Navbar
        projectPath={projectPath}
        setProjectPath={setProjectPath}
        isScanning={isScanning}
        onScan={scanProject}
        onCancel={cancelScan}
        currentView={currentView}
        onViewChange={setCurrentView}
        theme={theme}
        setTheme={setTheme}
      />

      {currentView !== 'all' && currentView !== 'web' ? (
        <FlowchartRenderer currentView={currentView} scanData={scanData} />
      ) : isFullscreen ? (
        <div style={{ width: '100vw', height: 'calc(100vh - 58px)', position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              right: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 1000,
              pointerEvents: 'none'
            }}
          >
            <button
              onClick={() => setIsFullscreen(false)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                backgroundColor: 'rgba(15,15,20,0.85)',
                backdropFilter: 'blur(8px)',
                color: '#fff',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                pointerEvents: 'auto'
              }}
            >
              <ArrowLeft size={14} />
              <span>Retour</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'rgba(15,15,20,0.85)', padding: '6px 16px', borderRadius: '8px', border: '1px solid var(--border)', backdropFilter: 'blur(8px)', pointerEvents: 'auto', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Search size={14} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Filtrer les fichiers..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none',
                    width: '180px'
                  }}
                />
              </div>

              <div style={{ height: '16px', width: '1px', backgroundColor: 'var(--border)' }}></div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-muted)' }}>
                <input
                  type="checkbox"
                  checked={showExternal}
                  onChange={(e) => setShowExternal(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <span>Packages externes</span>
              </label>

              <div style={{ height: '16px', width: '1px', backgroundColor: 'var(--border)' }}></div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-muted)' }}>
                <input
                  type="checkbox"
                  checked={showOnlyCycles}
                  onChange={(e) => setShowOnlyCycles(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ color: showOnlyCycles ? 'var(--cycle)' : 'inherit' }}>Cycles uniquement</span>
              </label>

              {cycles.cycleNodes.size > 0 && (
                <>
                  <div style={{ height: '16px', width: '1px', backgroundColor: 'var(--border)' }}></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--cycle)', backgroundColor: 'var(--cycle-muted)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                    <AlertTriangle size={12} color="var(--cycle)" />
                    <span>{cycles.cycleNodes.size} fichiers en cycle</span>
                  </div>
                </>
              )}

              {availableExtensions.length > 0 && (
                <>
                  <div style={{ height: '16px', width: '1px', backgroundColor: 'var(--border)' }}></div>
                  <div style={{ position: 'relative' }} onMouseLeave={() => setIsExtDropdownOpen(false)}>
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
                      <ChevronDown size={12} style={{ display: 'inline-block', transform: isExtDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
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
                                style={{ cursor: 'pointer' }}
                              />
                              <span>{ext}</span>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {isWebWarning ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: 'var(--bg)', gap: '12px', padding: '24px', textAlign: 'center' }}>
              <AlertTriangle size={48} color="var(--bottleneck)" />
              <h2 style={{ fontSize: '20px', color: '#fff', margin: 0, fontWeight: 'bold' }}>Le projet n'est pas un projet de développement web !</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '360px' }}>
                Ce projet ne contient aucun fichier HTML, CSS, JavaScript, TypeScript ou configuration web standard.
              </p>
            </div>
          ) : showWarning ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: 'var(--bg)', gap: '12px' }}>
              <AlertTriangle size={36} color="var(--bottleneck)" />
              <h2 style={{ fontSize: '18px', color: '#fff', margin: 0 }}>Graphe trop dense ({totalVisibleNodesCount} nœuds)</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Veuillez utiliser les filtres ci-dessus pour un affichage lisible.</p>
              <button
                onClick={() => setForceDisplay(true)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'var(--bottleneck)',
                  color: '#fff',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  marginTop: '8px'
                }}
              >
                Forcer l'affichage entier
              </button>
            </div>
          ) : (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <LayoutToolbar
                direction={direction}
                setDirection={setDirection}
                nodesep={nodesep}
                setNodesep={setNodesep}
                ranksep={ranksep}
                setRanksep={setRanksep}
                style={{ top: '70px', right: '16px' }}
              />
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                onNodeMouseEnter={(_, node) => setHoveredNodeId(node.id)}
                onNodeMouseLeave={() => setHoveredNodeId(null)}
                fitView
              >
                <Background color="#2e303a" gap={16} />
                <ControlsOverlay />
                <MiniMapPanel style={{ backgroundColor: 'var(--panel-bg)' }} nodeColor={(n) => n.data?.isPartOfCycle ? 'var(--cycle)' : (n.data?.isBottleneck ? 'var(--bottleneck)' : 'var(--accent)')} />
              </ReactFlow>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flex: 1, width: '100vw', height: 'calc(100vh - 58px)', overflow: 'hidden' }}>
          <Explorer
            structure={scanData?.structure}
            flatFiles={flatFiles}
            onToggleDirectory={toggleDirectory}
            onCollapseAll={collapseAll}
            gitStatuses={scanData?.git?.statuses}
            activeFile={activeFile}
            onSelectFile={setActiveFile}
          />
          <GraphPanel
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            filterQuery={filterQuery}
            setFilterQuery={setFilterQuery}
            showExternal={showExternal}
            setShowExternal={setShowExternal}
            showOnlyCycles={showOnlyCycles}
            setShowOnlyCycles={setShowOnlyCycles}
            cycleNodesCount={cycles.cycleNodes.size}
            availableExtensions={availableExtensions}
            selectedExtensions={selectedExtensions}
            setSelectedExtensions={setSelectedExtensions}
            hasData={!!scanData?.dependencies}
            showWarning={showWarning}
            totalVisibleNodesCount={totalVisibleNodesCount}
            setForceDisplay={setForceDisplay}
            setIsFullscreen={setIsFullscreen}
            onNodeMouseEnter={(_, node) => setHoveredNodeId(node.id)}
            onNodeMouseLeave={() => setHoveredNodeId(null)}
            isWebWarning={isWebWarning}
            isScanning={isScanning}
            scanProgress={scanProgress}
            direction={direction}
            setDirection={setDirection}
            nodesep={nodesep}
            setNodesep={setNodesep}
            ranksep={ranksep}
            setRanksep={setRanksep}
            activeFile={activeFile}
            onCloseActiveFile={() => setActiveFile(null)}
            scanData={scanData}
            projectPath={projectPath}
          />
          <GitPanel
            isGitRepo={scanData?.git?.is_git_repo ?? false}
            hasGitData={!!scanData?.git}
            gitSortBy={gitSortBy}
            setGitSortBy={setGitSortBy}
            sortedGitHotspots={sortedGitHotspots}
            onScan={scanProject}
            activeFile={activeFile}
            onSelectFile={setActiveFile}
          />
        </div>
      )}

      {scanError && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'rgba(28, 10, 10, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(244, 63, 94, 0.4)',
            borderRadius: '12px',
            padding: '14px 20px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 0 10px rgba(244, 63, 94, 0.1)',
            color: '#fda4af',
            fontSize: '13px',
            fontWeight: 500,
            maxWidth: '380px',
            animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          <AlertTriangle size={18} color="#f43f5e" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>{scanError}</div>
          <button
            onClick={() => setScanError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#fda4af',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '0 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.7,
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
          >
            &times;
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from {
            transform: translateY(-20px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
      <ToastContainer />
    </div>
  )
}

export default App
