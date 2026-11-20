import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState
} from '@xyflow/react'
import type { Node, Edge } from '@xyflow/react'
import { Code, HelpCircle } from 'lucide-react'

import { IfThenCustomNode } from './IfThenCustomNode'
import { PROCESS_TEMPLATES } from '../templates'
import { buildProcessTemplates } from '../utils/templateBuilders'
import { getLayoutedElements } from '../utils/layoutUtils'
import { LayoutToolbar } from './LayoutToolbar'
import { ControlsOverlay } from './ControlsOverlay'
import { FitViewHandler } from './FitViewHandler'

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

export const AppDevelopmentProcessFlowchart: React.FC<AppDevelopmentProcessFlowchartProps> = ({ scanData }) => {
  const projectTemplates = useMemo(() => {
    return buildProcessTemplates(scanData, PROCESS_TEMPLATES)
  }, [scanData])

  const initialKey = projectTemplates['project-lifecycle']
    ? 'project-lifecycle'
    : (Object.keys(projectTemplates)[0] || '')

  const [selectedTemplate, setSelectedTemplate] = useState<string>(initialKey)
  const activeTemplate = projectTemplates[selectedTemplate] ? selectedTemplate : initialKey

  const [direction, setDirection] = useState<'LR' | 'TB'>('TB')
  const [nodesep, setNodesep] = useState<number>(50)
  const [ranksep, setRanksep] = useState<number>(60)
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null)

  const layouted = useMemo(() => {
    const template = projectTemplates[activeTemplate]
    if (!template) {
      return { nodes: [] as Node[], edges: [] as Edge[] }
    }
    return getLayoutedElements(template.nodes, template.edges, direction, nodesep, ranksep)
  }, [activeTemplate, projectTemplates, direction, nodesep, ranksep])

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(layouted.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(layouted.edges)

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
      setNodes(layouted.nodes.map(n => ({
        ...n,
        data: { ...n.data, isDimmed: false }
      })))
      setEdges(layouted.edges.map(e => ({
        ...e,
        style: { ...e.style, opacity: 1 }
      })))
      return
    }

    const reachable = getReachableNodes(layouted.nodes, layouted.edges, focusedNodeId)

    setNodes(layouted.nodes.map(n => ({
      ...n,
      data: {
        ...n.data,
        isDimmed: !reachable.has(n.id)
      }
    })))

    setEdges(layouted.edges.map(e => {
      const isConnected = reachable.has(e.source) && reachable.has(e.target)
      return {
        ...e,
        style: {
          ...e.style,
          opacity: isConnected ? 1 : 0.15
        }
      }
    }))
  }, [layouted, focusedNodeId, setNodes, setEdges])

  const projectItems = Object.entries(projectTemplates).filter(([k]) => k === 'project-lifecycle')
  const staticItems = Object.entries(projectTemplates).filter(([k]) => k !== 'project-lifecycle')

  return (
    <div style={{ display: 'flex', flex: 1, height: '100%', backgroundColor: 'var(--bg)' }}>
      {/* Side Editor */}
      <div
        style={{
          width: '320px',
          borderRight: '1px solid var(--border)',
          backgroundColor: 'var(--panel-bg)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          overflowY: 'auto'
        }}
      >
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '12px' }}>
            Select a Process
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {projectItems.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Code size={12} /> Live Project Processes
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {projectItems.map(([key, temp]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedTemplate(key)
                        setFocusedNodeId(null)
                      }}
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
                      <div style={{ fontSize: '11px', color: activeTemplate === key ? 'var(--accent-fg)' : 'var(--text-muted)', opacity: activeTemplate === key ? 0.85 : 1, marginTop: '4px' }}>
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
                  Demo Templates
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {staticItems.map(([key, temp]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedTemplate(key)
                      setFocusedNodeId(null)
                    }}
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
                    <div style={{ fontSize: '11px', color: activeTemplate === key ? 'var(--accent-fg)' : 'var(--text-muted)', opacity: activeTemplate === key ? 0.85 : 1, marginTop: '4px' }}>
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
          <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '8px' }}>
            About this diagram
          </h2>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: '1.5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HelpCircle size={14} /> This diagram displays the project lifecycle.
            </div>
            <div>
              Live metrics are injected in real time after scanning your codebase.
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
          fitViewOptions={{ padding: 0.2 }}
        >
          <Background color="var(--flow-grid)" gap={16} />
          <ControlsOverlay />
          <FitViewHandler triggerKey={`${activeTemplate}-${direction}-${nodesep}-${ranksep}-${nodes.length}`} />
        </ReactFlow>
      </div>
    </div>
  )
}
