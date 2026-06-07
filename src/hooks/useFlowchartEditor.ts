import React, { useState, useEffect } from 'react'
import {
  useNodesState,
  useEdgesState,
  Position,
  useReactFlow
} from '@xyflow/react'
import type { Node, Edge } from '@xyflow/react'


export const useFlowchartEditor = (options?: { direction?: 'LR' | 'TB' }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  
  const { fitView } = useReactFlow()

  useEffect(() => {
    if (options?.direction && nodes.length > 0) {
      const timer = setTimeout(() => {
        fitView({ duration: 300 })
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [options?.direction, fitView])
  
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
    
    let newX = 250
    let newY = 250
    let parentId: string | null = null

    if (nodes.length > 0) {
      const selectedNode = nodes.find(n => n.id === selectedNodeId)
      if (selectedNode) {
        newX = selectedNode.position.x
        newY = selectedNode.position.y + 100
        parentId = selectedNode.id
      } else {
        const bottomNode = nodes.reduce((acc, curr) => curr.position.y > acc.position.y ? curr : acc, nodes[0])
        newX = bottomNode.position.x
        newY = bottomNode.position.y + 100
        parentId = bottomNode.id
      }
    }

    const newNode: Node = {
      id,
      type: 'customNode',
      position: { x: newX + (Math.random() - 0.5) * 10, y: newY },
      data: {
        label: type === 'condition' ? 'Nouvelle Condition ?' : 'Nouvelle Action',
        type
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top
    }

    setNodes((nds) => [...nds, newNode])
    
    if (parentId) {
      const newEdge: Edge = {
        id: `edge-${parentId}-${id}`,
        source: parentId,
        target: id,
        type: 'smoothstep',
        style: { stroke: 'var(--accent)' }
      }
      setEdges((eds) => [...eds, newEdge])
    }

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
