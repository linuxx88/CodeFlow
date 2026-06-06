import React from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background
} from '@xyflow/react'
import type { Node, Edge } from '@xyflow/react'
import { FileNode } from './FileNode'
import { GraphToolbar } from './GraphToolbar'
import { AlertTriangle, GitBranch } from 'lucide-react'
import { LayoutToolbar } from './LayoutToolbar'


interface GraphPanelProps {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: any
  onEdgesChange: any
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
  showWarning: boolean
  totalVisibleNodesCount: number
  setForceDisplay: (val: boolean) => void
  setIsFullscreen: (val: boolean) => void
  onNodeMouseEnter?: (event: React.MouseEvent, node: Node) => void
  onNodeMouseLeave?: (event: React.MouseEvent, node: Node) => void
  isWebWarning?: boolean
  isScanning: boolean
  scanProgress: { stage: string; current?: number; total?: number; message: string } | null
  direction: 'LR' | 'TB'
  setDirection: (dir: 'LR' | 'TB') => void
  nodesep: number
  setNodesep: (sep: number) => void
  ranksep: number
  setRanksep: (sep: number) => void
}

const nodeTypes = {
  custom: FileNode
}

export const GraphPanel: React.FC<GraphPanelProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
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
  showWarning,
  totalVisibleNodesCount,
  setForceDisplay,
  setIsFullscreen,
  onNodeMouseEnter,
  onNodeMouseLeave,
  isWebWarning,
  isScanning,
  scanProgress,
  direction,
  setDirection,
  nodesep,
  setNodesep,
  ranksep,
  setRanksep
}) => {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <GraphToolbar
        filterQuery={filterQuery}
        setFilterQuery={setFilterQuery}
        showExternal={showExternal}
        setShowExternal={setShowExternal}
        showOnlyCycles={showOnlyCycles}
        setShowOnlyCycles={setShowOnlyCycles}
        cycleNodesCount={cycleNodesCount}
        availableExtensions={availableExtensions}
        selectedExtensions={selectedExtensions}
        setSelectedExtensions={setSelectedExtensions}
        hasData={hasData}
        setIsFullscreen={setIsFullscreen}
      />

      {/* Flow Viewer / Warning Card */}
      <div style={{ flex: 1, position: 'relative' }}>
        {isScanning ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', color: '#fff', backgroundColor: 'rgba(10, 10, 15, 0.4)' }}>
            <span
              className="spinner"
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid var(--accent)',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 0.8s linear infinite'
              }}
            ></span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{scanProgress?.message || 'Scan en cours...'}</span>
              {scanProgress?.current !== undefined && scanProgress?.total !== undefined && (
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Progression : {Math.round((scanProgress.current / scanProgress.total) * 100)}% ({scanProgress.current} / {scanProgress.total})
                </span>
              )}
            </div>
          </div>
        ) : hasData ? (
          isWebWarning ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', gap: '12px', padding: '24px', textAlign: 'center' }}>
              <AlertTriangle size={48} color="var(--bottleneck)" />
              <h2 style={{ fontSize: '18px', color: '#fff', margin: 0, fontWeight: 'bold' }}>projet n'est pas developpement web !</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '320px' }}>
                Ce projet ne contient aucun fichier HTML, CSS, JavaScript, TypeScript ou configuration web standard.
              </p>
            </div>
          ) : showWarning ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', gap: '10px' }}>
              <AlertTriangle size={32} color="var(--bottleneck)" />
              <h3 style={{ fontSize: '15px', color: '#fff', margin: 0 }}>Graphe trop dense ({totalVisibleNodesCount} nœuds)</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>Filtrez par nom/dossier pour un affichage lisible.</p>
              <button
                onClick={() => setForceDisplay(true)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'var(--bottleneck)',
                  color: '#fff',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  marginTop: '4px'
                }}
              >
                Forcer l'affichage
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
                style={{ top: '16px', right: '16px' }}
              />
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                onNodeMouseEnter={onNodeMouseEnter}
                onNodeMouseLeave={onNodeMouseLeave}
                fitView
              >
                <Background color="#2e303a" gap={16} />
                <Controls />
                <MiniMap
                  style={{ backgroundColor: 'var(--panel-bg)' }}
                  nodeColor={(n) => n.data?.isBottleneck ? 'var(--bottleneck)' : 'var(--accent)'}
                />
              </ReactFlow>
            </div>
          )
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px', color: 'var(--text-muted)' }}>
            <GitBranch size={32} style={{ opacity: 0.5 }} />
            <span style={{ fontSize: '12px' }}>Scannez le projet pour visualiser le graphe de dépendances.</span>
          </div>
        )}
      </div>
    </div>
  )
}

