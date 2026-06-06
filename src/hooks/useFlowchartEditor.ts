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

    if (!isFlowchartNodeData(node.data)) {
      console.error('Invalid node data properties', node.data)
      return
    }

    setSelectedNodeId(node.id)
    setNodeLabel(node.data.label)
    setNodeType(node.data.type)
  }

  const handleUpdateNode = () => {
    if (!selectedNodeId) return
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              label: nodeLabel,
              type: nodeType
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
