import React, { useState } from 'react'
import {
  useNodesState,
  useEdgesState,
  Position
} from '@xyflow/react'
import type { Node, Edge } from '@xyflow/react'

interface FlowchartNodeData {
  label: string
  type: 'condition' | 'action' | 'start'
}

function isFlowchartNodeData(data: unknown): data is FlowchartNodeData {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  if (typeof d.label !== 'string') return false
  return d.type === 'condition' || d.type === 'action' || d.type === 'start'
}

export const useFlowchartEditor = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [nodeLabel, setNodeLabel] = useState<string>('')
  const [nodeType, setNodeType] = useState<'condition' | 'action' | 'start'>('action')

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    if (!node || typeof node.id !== 'string') {
      console.error('Invalid node structure: missing or invalid id')
      return
    }

    const data = node.data as any
    const label = data?.label || ''
    const type = data?.type || 'action'

    setSelectedNodeId(node.id)
    setNodeLabel(label)
    setNodeType(type)
  }

  const handleUpdateNode = () => {
    if (!selectedNodeId) return
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNodeId) {
          const originalType = (node.data as any)?.type
          const finalType = originalType === 'start' ? 'start' : (nodeType || originalType || 'action')
          return {
            ...node,
            data: {
              ...node.data,
              label: nodeLabel,
              type: finalType
            }
          }
        }
        return node
      })
    )
  }

  const handleAddNode = (type: 'condition' | 'action') => {
    const id = `node-${crypto.randomUUID()}`
    const newNode: Node = {
      id,
      type: 'customNode',
      position: { x: 150 + Math.random() * 100, y: 150 + Math.random() * 100 },
      data: {
        label: type === 'condition' ? 'Nouvelle Condition ?' : 'Nouvelle Action',
        type
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top
    }
    setNodes((nds) => [...nds, newNode])
    setSelectedNodeId(id)
    setNodeLabel(newNode.data.label as string)
    setNodeType(type)
  }

  const handleDeleteNode = () => {
    if (!selectedNodeId || selectedNodeId === 'start') return
    setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId))
    setEdges((eds) => eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId))
    setSelectedNodeId(null)
    setNodeLabel('')
    setNodeType('action')
  }

  return {
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
    handleDeleteNode
  }
}
