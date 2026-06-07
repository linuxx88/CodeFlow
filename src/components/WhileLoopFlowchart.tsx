import React, { useState, useEffect, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  ReactFlowProvider,
  BaseEdge,
  EdgeLabelRenderer
} from '@xyflow/react'
import type { EdgeProps, Node, Edge } from '@xyflow/react'
import { Plus, Trash2, Check, HelpCircle } from 'lucide-react'

import { IfThenCustomNode } from './IfThenCustomNode'
import { useFlowchartEditor } from '../hooks/useFlowchartEditor'
import { LOOP_TEMPLATES } from '../templates'
import { buildLoopTemplates } from '../utils/templateBuilders'
import { getLayoutedElements } from '../utils/layoutUtils'
import { LayoutToolbar } from './LayoutToolbar'
import { ControlsOverlay } from './ControlsOverlay'

interface WhileLoopFlowchartProps {
  scanData?: any
}

const nodeTypes = {
  customNode: IfThenCustomNode
}

// Custom Bezier curve edge component for return paths
const LoopReturnEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition: _sourcePosition,
  targetPosition: _targetPosition,
  style = {},
  markerEnd,
  label,
  labelStyle,
}) => {
  const dx = targetX - sourceX
  const dy = targetY - sourceY
  
  const offset = -140
  let path = ''
  let midX = (sourceX + targetX) / 2
  let midY = (sourceY + targetY) / 2

  if (Math.abs(dy) > Math.abs(dx)) {
    // Vertical layout return path - bow left
    path = `M ${sourceX},${sourceY} C ${sourceX + offset},${sourceY} ${targetX + offset},${targetY} ${targetX},${targetY}`
    midX += offset * 0.75
  } else {
    // Horizontal layout return path - bow up
    path = `M ${sourceX},${sourceY} C ${sourceX},${sourceY + offset} ${targetX},${targetY + offset} ${targetX},${targetY}`
    midY += offset * 0.75
  }

  return (
    <>
      <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${midX}px, ${midY}px)`,
              background: 'var(--panel-bg)',
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              fontSize: '10px',
              fontWeight: 'bold',
              color: '#eab308',
              pointerEvents: 'all',
              whiteSpace: 'nowrap',
              ...labelStyle,
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

const edgeTypes = {
  loopReturn: LoopReturnEdge
}

// Preprocess edges to set type to loopReturn for return paths
const preprocessEdges = (edges: Edge[], nodes: Node[], direction: 'LR' | 'TB'): Edge[] => {
  return edges.map(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source)
    const targetNode = nodes.find(n => n.id === edge.target)
    
    if (sourceNode && targetNode) {
      const isBackward = direction === 'TB'
        ? sourceNode.position.y > targetNode.position.y
        : sourceNode.position.x > targetNode.position.x
        
      if (isBackward) {
        return {
          ...edge,
          type: 'loopReturn'
        }
      }
    }
    return edge
  })
}

const WhileLoopFlowchartContent: React.FC<WhileLoopFlowchartProps> = ({ scanData }) => {
  const projectTemplates = useMemo(() => {
    return buildLoopTemplates(scanData, LOOP_TEMPLATES)
  }, [scanData])

  const defaultTemplateKey = Object.keys(projectTemplates)[0] || ''
  const [activeTemplate, setActiveTemplate] = useState<string>(defaultTemplateKey)
  
  const [direction, setDirection] = useState<'LR' | 'TB'>('TB')
  const [nodesep, setNodesep] = useState<number>(80) // Enforce minimum 80px nodesep
  const [ranksep, setRanksep] = useState<number>(90)

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    setNodes,
    setEdges,
    selectedNodeId,
    setSelectedNodeId,
    nodeLabel,
    setNodeLabel,
    nodeType,
    setNodeType,
    handleNodeClick,
    handleUpdateNode,
    handleAddNode,
    handleDeleteNode,
    clearFocus
  } = useFlowchartEditor({ direction })

  // Keep separation above minimum node separation threshold (80px)
  const safeNodesep = Math.max(80, nodesep)

  useEffect(() => {
    const projectKeys = Object.keys(projectTemplates).filter(k => k.startsWith('project-'))
    const timer = setTimeout(() => {
      if (projectKeys.length > 0) {
        setActiveTemplate(projectKeys[0])
      } else {
        const defaultKey = Object.keys(projectTemplates)[0] || ''
        setActiveTemplate(defaultKey)
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [projectTemplates])

  // Load template nodes & edges and apply layout
  useEffect(() => {
    const template = projectTemplates[activeTemplate]
    if (template) {
      const timer = setTimeout(() => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          template.nodes,
          template.edges,
          direction,
          safeNodesep,
          ranksep
        )
        setNodes(layoutedNodes)
        setEdges(preprocessEdges(layoutedEdges, layoutedNodes, direction))
        setSelectedNodeId(null)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [activeTemplate, projectTemplates, direction, safeNodesep, ranksep, setNodes, setEdges, setSelectedNodeId])

  const [lastLayoutKey, setLastLayoutKey] = useState('')
  useEffect(() => {
    const key = `${nodes.length}-${edges.length}-${direction}-${safeNodesep}-${ranksep}-${nodes.map(n => `${n.id}:${n.data?.label || ''}:${n.data?.type || ''}`).join(',')}`
    if (key !== lastLayoutKey && nodes.length > 0) {
      const timer = setTimeout(() => {
        setLastLayoutKey(key)
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          nodes,
          edges,
          direction,
          safeNodesep,
          ranksep
        )
        setNodes(layoutedNodes)
        setEdges(preprocessEdges(layoutedEdges, layoutedNodes, direction))
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [nodes.length, edges.length, direction, safeNodesep, ranksep, lastLayoutKey, nodes, edges, setNodes, setEdges])

  const staticItems = Object.entries(projectTemplates).filter(([k]) => !k.startsWith('project-'))

  return (
    <div style={{ display: 'flex', flex: 1, height: '100%', backgroundColor: 'var(--bg)' }}>
      {/* Side Editor */}
      <div
        style={{
          width: '320px',
          borderRight: '1px solid var(--border)',
          backgroundColor: 'var(--panel-bg)',
          backdropFilter: 'blur(12px)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          overflowY: 'auto',
          transition: 'background-color 0.3s, border-color 0.3s'
        }}
      >
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '12px' }}>
            Sélectionner un Modèle de Boucle
          </h2>
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

        <div style={{ height: '1px', backgroundColor: 'var(--border)' }}></div>

        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '12px' }}>
            Éditeur de Nœud
          </h2>
          {selectedNodeId ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Texte du Nœud
                </label>
                <input
                  type="text"
                  value={nodeLabel}
                  onChange={(e) => setNodeLabel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text)',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {selectedNodeId !== 'start' && (
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Type de Nœud
                  </label>
                  <select
                    value={nodeType}
                    onChange={(e: any) => setNodeType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--dropdown-bg)',
                      color: 'var(--text)',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  >
                    <option value="condition">SI / Condition</option>
                    <option value="action">ALORS / Action</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  onClick={handleUpdateNode}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--accent)',
                    color: 'var(--accent-fg)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Check size={14} /> Appliquer
                </button>
                {selectedNodeId !== 'start' && (
                  <button
                    onClick={handleDeleteNode}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(244, 63, 94, 0.15)',
                      color: '#f43f5e',
                      border: '1px solid rgba(244, 63, 94, 0.3)',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HelpCircle size={14} /> Cliquez sur un nœud pour le modifier.
            </div>
          )}
        </div>

        <div style={{ height: '1px', backgroundColor: 'var(--border)' }}></div>

        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '12px' }}>
            Ajouter un Élément
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleAddNode('condition')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '6px',
                backgroundColor: 'rgba(234, 179, 8, 0.15)',
                color: '#eab308',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <Plus size={14} /> Condition
            </button>
            <button
              onClick={() => handleAddNode('action')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '6px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <Plus size={14} /> Action
            </button>
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
          key={`${activeTemplate}-while-loop`}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={handleNodeClick}
          onPaneClick={clearFocus}
          fitView
        >
          <Background color="var(--border)" gap={16} />
          <ControlsOverlay />
        </ReactFlow>
      </div>
    </div>
  )
}

export const WhileLoopFlowchart: React.FC<WhileLoopFlowchartProps> = ({ scanData }) => {
  return (
    <ReactFlowProvider>
      <WhileLoopFlowchartContent scanData={scanData} />
    </ReactFlowProvider>
  )
}
