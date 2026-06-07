import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Position
} from '@xyflow/react'
import type { Node, Edge } from '@xyflow/react'
import { Code, HelpCircle } from 'lucide-react'

import { IfThenCustomNode } from './IfThenCustomNode'
import { PROCESS_TEMPLATES } from '../templates'
import { getLayoutedElements } from '../utils/layoutUtils'
import { LayoutToolbar } from './LayoutToolbar'

interface AppDevelopmentProcessFlowchartProps {
  scanData?: any
}

const nodeTypes = {
  customNode: IfThenCustomNode
}

function getReachableNodes(_nodes: Node[], edges: Edge[], startNodeId: string): Set<string> {
  const reachable = new Set<string>([startNodeId])
  const queueDown = [startNodeId]
  while (queueDown.length > 0) {
    const curr = queueDown.shift()!
    for (const edge of edges) {
      if (edge.source === curr && !reachable.has(edge.target)) {
        reachable.add(edge.target)
        queueDown.push(edge.target)
      }
    }
  }
  const queueUp = [startNodeId]
  while (queueUp.length > 0) {
    const curr = queueUp.shift()!
    for (const edge of edges) {
      if (edge.target === curr && !reachable.has(edge.source)) {
        reachable.add(edge.source)
        queueUp.push(edge.source)
      }
    }
  }
  return reachable
}

export const AppDevelopmentProcessFlowchart: React.FC<AppDevelopmentProcessFlowchartProps> = ({
  scanData
}) => {
  const projectTemplates = useMemo(() => {
    const temps: Record<string, any> = { ...PROCESS_TEMPLATES }
    
    if (scanData) {
      const fileCount = scanData.dependencies?.nodes?.filter((n: any) => n.type === 'file').length || 0
      const pkgCount = scanData.dependencies?.nodes?.filter((n: any) => n.type === 'package').length || 0
      const linkCount = scanData.dependencies?.links?.length || 0
      const classCount = scanData.classes?.reduce((acc: number, f: any) => acc + f.items.length, 0) || 0
      const functionCount = scanData.algorithms?.reduce((acc: number, f: any) => acc + f.items.length, 0) || 0
      const hotspot = scanData.git?.hotspots?.[0]?.file || 'Aucun'
      const commits = scanData.git?.hotspots?.[0]?.commits || 0

      const nodes: Node[] = [
        {
          id: 'live-plan',
          type: 'customNode',
          position: { x: 250, y: 20 },
          data: { label: `1. Initialisation : Projet scanné avec ${fileCount} fichiers`, type: 'start' },
          sourcePosition: Position.Bottom
        },
        {
          id: 'live-arch',
          type: 'customNode',
          position: { x: 250, y: 120 },
          data: { label: `2. Architecture : ${pkgCount} packages, ${linkCount} liaisons`, type: 'condition' },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top
        },
        {
          id: 'live-code',
          type: 'customNode',
          position: { x: 250, y: 220 },
          data: { label: `3. Code : ${functionCount} fonctions, ${classCount} classes`, type: 'action' },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top
        },
        {
          id: 'live-quality',
          type: 'customNode',
          position: { x: 250, y: 320 },
          data: { label: `4. Git : Hotspot principal: ${hotspot} (${commits} commits)`, type: 'action' },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top
        },
        {
          id: 'live-status',
          type: 'customNode',
          position: { x: 250, y: 420 },
          data: { label: '5. Statut : Prêt pour la production (build OK)', type: 'action' },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top
        }
      ]

      const edges: Edge[] = [
        { id: 'el-1', source: 'live-plan', target: 'live-arch', type: 'smoothstep', style: { stroke: 'var(--accent)' } },
        { id: 'el-2', source: 'live-arch', target: 'live-code', type: 'smoothstep', style: { stroke: 'var(--accent)' } },
        { id: 'el-3', source: 'live-code', target: 'live-quality', type: 'smoothstep', style: { stroke: 'var(--accent)' } },
        { id: 'el-4', source: 'live-quality', target: 'live-status', type: 'smoothstep', style: { stroke: 'var(--accent)' } }
      ]

      temps['project-lifecycle'] = {
        name: 'Processus Live de mon Projet',
        description: 'Cycle et métriques en temps réel issues du scan.',
        nodes,
        edges
      }
    }

    return temps
  }, [scanData])

  const defaultTemplateKey = Object.keys(projectTemplates)[0] || ''
  const [activeTemplate, setActiveTemplate] = useState<string>(defaultTemplateKey)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  const [direction, setDirection] = useState<'LR' | 'TB'>('TB')
  const [nodesep, setNodesep] = useState<number>(50)
  const [ranksep, setRanksep] = useState<number>(60)

  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null)

  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)
  useEffect(() => {
    nodesRef.current = nodes
    edgesRef.current = edges
  })

  const clearFocus = () => {
    setFocusedNodeId(null)
  }

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    setFocusedNodeId(prev => prev === node.id ? null : node.id)
  }

  useEffect(() => {
    if (!focusedNodeId) {
      setNodes(nds => nds.map(n => ({
        ...n,
        data: { ...n.data, isDimmed: false }
      })))
      setEdges(eds => eds.map(e => ({
        ...e,
        style: { ...e.style, opacity: 1 }
      })))
      return
    }

    const reachable = getReachableNodes(nodesRef.current, edgesRef.current, focusedNodeId)

    setNodes(nds => nds.map(n => ({
      ...n,
      data: {
        ...n.data,
        isDimmed: !reachable.has(n.id)
      }
    })))

    setEdges(eds => eds.map(e => {
      const isConnected = reachable.has(e.source) && reachable.has(e.target)
      return {
        ...e,
        style: {
          ...e.style,
          opacity: isConnected ? 1 : 0.15
        }
      }
    }))
  }, [focusedNodeId, setNodes, setEdges])

  // Auto-switch to live project lifecycle if scan completes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (projectTemplates['project-lifecycle']) {
        setActiveTemplate('project-lifecycle')
      } else {
        const defaultKey = Object.keys(projectTemplates)[0] || ''
        setActiveTemplate(defaultKey)
      }
      setFocusedNodeId(null)
    }, 0)
    return () => clearTimeout(timer)
  }, [projectTemplates])

  // Load template nodes & edges
  useEffect(() => {
    const template = projectTemplates[activeTemplate]
    if (template) {
      const timer = setTimeout(() => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          template.nodes,
          template.edges,
          direction,
          nodesep,
          ranksep
        )
        setNodes(layoutedNodes)
        setEdges(layoutedEdges)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [activeTemplate, projectTemplates, direction, nodesep, ranksep, setNodes, setEdges])

  const [lastLayoutKey, setLastLayoutKey] = useState('')
  useEffect(() => {
    const key = `${nodes.length}-${edges.length}-${direction}-${nodesep}-${ranksep}`
    if (key !== lastLayoutKey && nodes.length > 0) {
      const timer = setTimeout(() => {
        setLastLayoutKey(key)
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          nodes,
          edges,
          direction,
          nodesep,
          ranksep
        )
        setNodes(layoutedNodes)
        setEdges(layoutedEdges)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [nodes.length, edges.length, direction, nodesep, ranksep, lastLayoutKey, nodes, edges, setNodes, setEdges])

  const projectItems = Object.entries(projectTemplates).filter(([k]) => k === 'project-lifecycle')
  const staticItems = Object.entries(projectTemplates).filter(([k]) => k !== 'project-lifecycle')

  return (
    <div style={{ display: 'flex', flex: 1, height: '100%', backgroundColor: 'var(--bg)' }}>
      {/* Side Editor */}
      <div
        style={{
          width: '320px',
          borderRight: '1px solid var(--border)',
          backgroundColor: 'rgba(10, 10, 15, 0.5)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          overflowY: 'auto'
        }}
      >
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginBottom: '12px' }}>
            Sélectionner un Processus
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {projectItems.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Code size={12} /> Processus Live du Projet
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {projectItems.map(([key, temp]) => (
                    <button
                      key={key}
                      onClick={() => setActiveTemplate(key)}
                      style={{
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        backgroundColor: activeTemplate === key ? 'var(--accent)' : 'var(--input-bg)',
                        color: activeTemplate === key ? 'var(--accent-fg)' : 'var(--text)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '13px',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <div style={{ fontWeight: 'bold' }}>{temp.name}</div>
                      <div style={{ fontSize: '11px', color: activeTemplate === key ? '#e0e0ff' : 'var(--text-muted)', marginTop: '4px' }}>
                        {temp.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              {projectItems.length > 0 && (
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Modèles de Démo
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {staticItems.map(([key, temp]) => (
                  <button
                    key={key}
                    onClick={() => setActiveTemplate(key)}
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      backgroundColor: activeTemplate === key ? 'var(--accent)' : 'var(--input-bg)',
                      color: activeTemplate === key ? 'var(--accent-fg)' : 'var(--text)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '13px',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <div style={{ fontWeight: 'bold' }}>{temp.name}</div>
                    <div style={{ fontSize: '11px', color: activeTemplate === key ? '#e0e0ff' : 'var(--text-muted)', marginTop: '4px' }}>
                      {temp.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: 'var(--border)' }}></div>

        <div>
          <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>
            À propos de ce diagramme
          </h2>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: '1.5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HelpCircle size={14} /> Ce diagramme affiche le cycle de vie du projet.
            </div>
            <div>
              Les métriques live sont injectées en temps réel après l'analyse de votre code.
            </div>
          </div>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <LayoutToolbar
          direction={direction}
          setDirection={setDirection}
          nodesep={nodesep}
          setNodesep={setNodesep}
          ranksep={ranksep}
          setRanksep={setRanksep}
        />
        <ReactFlow
          key={`${activeTemplate}-process-flowchart`}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          onPaneClick={clearFocus}
          onlyRenderVisibleElements={nodes.length > 80}
          fitView
        >
          <Background color="#2e303a" gap={16} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  )
}
