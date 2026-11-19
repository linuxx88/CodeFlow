import { useState, useMemo, useEffect } from 'react'
import {
  ReactFlow,
  Background
} from '@xyflow/react'
import {
  AlertTriangle,
  ArrowLeft
} from 'lucide-react'

import { Navbar } from './components/Navbar'
import { Explorer } from './components/Explorer'
import { GraphPanel } from './components/GraphPanel'
import { GraphToolbar } from './components/GraphToolbar'
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
import { FitViewHandler } from './components/FitViewHandler'
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
  const [gitSortBy, setGitSortBy] = useState<'score' | 'commits' | 'authors'>('score')

  useEffect(() => {
    if (!isFullscreen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])
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
  const [nodesep, setNodesep] = useState<number>(70)
  const [ranksep, setRanksep] = useState<number>(160)

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
        <div style={{ flex: 1, minHeight: 0, width: '100vw', position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              right: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '12px',
              zIndex: 1000,
              pointerEvents: 'none'
            }}
          >
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--panel-bg)',
                backdropFilter: 'blur(8px)',
                color: 'var(--text)',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                pointerEvents: 'auto',
                boxShadow: '0 4px 12px var(--shadow)'
              }}
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', pointerEvents: 'none', maxWidth: '100%' }}>
              <GraphToolbar
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
                hasData={false}
                style={{
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  pointerEvents: 'auto',
                  boxShadow: '0 4px 12px var(--shadow)'
                }}
              />

              {!isWebWarning && !showWarning && (
                <LayoutToolbar
                  direction={direction}
                  setDirection={setDirection}
                  nodesep={nodesep}
                  setNodesep={setNodesep}
                  ranksep={ranksep}
                  setRanksep={setRanksep}
                  style={{ position: 'relative', top: 'auto', right: 'auto', pointerEvents: 'auto' }}
                />
              )}
            </div>
          </div>

          {isWebWarning ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: 'var(--bg)', gap: '12px', padding: '24px', textAlign: 'center' }}>
              <AlertTriangle size={48} color="var(--bottleneck)" />
              <h2 style={{ fontSize: '20px', color: 'var(--text)', margin: 0, fontWeight: 'bold' }}>Not a web development project!</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '360px' }}>
                This project does not contain any HTML, CSS, JavaScript, TypeScript, or standard web configuration files.
              </p>
            </div>
          ) : showWarning ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: 'var(--bg)', gap: '12px' }}>
              <AlertTriangle size={36} color="var(--bottleneck)" />
              <h2 style={{ fontSize: '18px', color: 'var(--text)', margin: 0 }}>Graph too dense ({totalVisibleNodesCount} nodes)</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Please use the filters above for a readable display.</p>
              <button
                type="button"
                onClick={() => setForceDisplay(true)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'var(--bottleneck)',
                  color: 'var(--accent-fg)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  marginTop: '8px'
                }}
              >
                Force full display
              </button>
            </div>
          ) : (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                onNodeMouseEnter={(_, node) => setHoveredNodeId(node.id)}
                onNodeMouseLeave={() => setHoveredNodeId(null)}
                onlyRenderVisibleElements={nodes.length > 80}
                minZoom={0.05}
                fitView
                fitViewOptions={{ padding: 0.2 }}
              >
                <Background color="var(--flow-grid)" gap={16} />
                <ControlsOverlay />
                <FitViewHandler triggerKey={`${direction}-${nodesep}-${ranksep}-${activeFile || ''}-${nodes.length}`} />
                <MiniMapPanel style={{ backgroundColor: 'var(--panel-bg)' }} nodeColor={(n) => n.data?.isPartOfCycle ? 'var(--cycle)' : (n.data?.isBottleneck ? 'var(--bottleneck)' : 'var(--accent)')} />
              </ReactFlow>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flex: 1, minHeight: 0, width: '100vw', overflow: 'hidden' }}>
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
          role="alert"
          style={{
            position: 'fixed',
            top: '74px',
            right: '20px',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'var(--dropdown-bg)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid var(--bottleneck)',
            borderRadius: '12px',
            padding: '14px 20px',
            boxShadow: '0 20px 25px -5px var(--shadow), 0 0 10px var(--bottleneck-muted)',
            color: 'var(--text)',
            fontSize: '13px',
            fontWeight: 500,
            maxWidth: '380px',
            animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          <AlertTriangle size={18} color="var(--bottleneck)" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>{scanError}</div>
          <button
            onClick={() => setScanError(null)}
            aria-label="Close error"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
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
