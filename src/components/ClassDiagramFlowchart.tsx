import React, { useState, useEffect, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from '@xyflow/react'
import type { Node, Edge } from '@xyflow/react'
import { Code, HelpCircle } from 'lucide-react'

import { ClassCustomNode } from './ClassCustomNode'
import { CLASS_TEMPLATES } from '../templates'
import { getLayoutedElements } from '../utils/layoutUtils'
import { LayoutToolbar } from './LayoutToolbar'

interface ClassDiagramFlowchartProps {
  scanData?: any
}

const nodeTypes = {
  classNode: ClassCustomNode
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

export const ClassDiagramFlowchart: React.FC<ClassDiagramFlowchartProps> = ({ scanData }) => {
  const projectTemplates = useMemo(() => {
    const temps: Record<string, any> = { ...CLASS_TEMPLATES }
    if (scanData?.classes) {
      for (const classFile of scanData.classes) {
        const file = classFile.file
        const items = classFile.items
        
        if (items.length === 0) continue

        const nodes: Node[] = []
        const edges: Edge[] = []
        
        items.forEach((item: any, idx: number) => {
          const classNodeId = `class-${item.name.toLowerCase()}`
          
          nodes.push({
            id: classNodeId,
            type: 'classNode',
            position: { x: 50 + (idx % 3) * 260, y: 50 + Math.floor(idx / 3) * 280 },
            data: {
              name: item.name,
              inherits: item.inherits,
              properties: item.properties,
              methods: item.methods
            }
          })
        })

        items.forEach((item: any) => {
          if (item.inherits) {
            const parentId = `class-${item.inherits.toLowerCase()}`
            const childId = `class-${item.name.toLowerCase()}`
            if (nodes.some(n => n.id === parentId)) {
              edges.push({
                id: `edge-inherits-${childId}-${parentId}`,
                source: childId,
                target: parentId,
                type: 'smoothstep',
                label: 'HÉRITE',
                style: { stroke: 'var(--accent)', strokeWidth: 2 },
                labelStyle: { fill: 'var(--accent)', fontWeight: 'bold' }
              })
            }
          }
        })
        
        temps[`project-${file}`] = {
          name: `Projet: ${file}`,
          description: `Diagramme de classes - ${items.length} classes détectées.`,
          nodes,
          edges
        }
      }
    }
    return temps
  }, [scanData])

  const defaultTemplateKey = Object.keys(projectTemplates)[0] || ''
  const [activeTemplate, setActiveTemplate] = useState<string>(defaultTemplateKey)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  const [direction, setDirection] = useState<'LR' | 'TB'>('LR')
  const [nodesep, setNodesep] = useState<number>(50)
  const [ranksep, setRanksep] = useState<number>(60)

  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null)

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

    const reachable = getReachableNodes(nodes, edges, focusedNodeId)

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
  }, [focusedNodeId])

  // Auto-switch to live project diagram if scan completes
  useEffect(() => {
    const projectKeys = Object.keys(projectTemplates).filter(k => k.startsWith('project-'))
    const timer = setTimeout(() => {
      if (projectKeys.length > 0) {
        setActiveTemplate(projectKeys[0])
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
    const key = `${nodes.length}-${edges.length}-${direction}-${nodesep}-${ranksep}-${nodes.map(n => {
      const data = n.data as any;
      const props = Array.isArray(data?.properties) ? data.properties : [];
      const meths = Array.isArray(data?.methods) ? data.methods : [];
      return `${n.id}:${data?.name || ''}:${props.join(',')}:${meths.join(',')}`;
    }).join(',')}`
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

  const projectItems = Object.entries(projectTemplates).filter(([k]) => k.startsWith('project-'))
  const staticItems = Object.entries(projectTemplates).filter(([k]) => !k.startsWith('project-'))

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
            Sélectionner un Diagramme
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {projectItems.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Code size={12} /> Classes Live du Projet
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
                      <div style={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{temp.name}</div>
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
              <HelpCircle size={14} /> Ce diagramme UML affiche les classes, attributs et méthodes extraits.
            </div>
            <div>
              Les flèches indiquent la relation d'héritage (<span style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>extends</span>) entre les classes.
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
          key={`${activeTemplate}-class-diagram`}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          onPaneClick={clearFocus}
          fitView
        >
          <Background color="#2e303a" gap={16} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  )
}
