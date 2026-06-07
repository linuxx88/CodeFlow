import React, { useState, useEffect } from 'react'
import {
  useNodesState,
  useEdgesState,
  Position,
  useReactFlow
} from '@xyflow/react'
import type { Node, Edge } from '@xyflow/react'

function getReachableNodes(_nodes: Node[], edges: Edge[], startNodeId: string): Set<string> {
  const reachable = new Set<string>([startNodeId])
  
  // Downstream traversal
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

  // Upstream traversal
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
  
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null)

  const clearFocus = () => {
    setFocusedNodeId(null)
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

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    if (!node || typeof node.id !== 'string') {
      console.error('Invalid node structure: missing or invalid id')
      return
    }

    setFocusedNodeId(prev => prev === node.id ? null : node.id)

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
    handleDeleteNode,
    focusedNodeId,
    clearFocus
  }
}
