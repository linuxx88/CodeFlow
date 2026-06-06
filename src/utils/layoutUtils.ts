import dagre from '@dagrejs/dagre'
import { Position } from '@xyflow/react'
import type { Node, Edge } from '@xyflow/react'

export const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = 'LR',
  nodesep = 40,
  ranksep = 80
) => {
  if (nodes.length === 0) return { nodes, edges }

  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  
  const isHorizontal = direction === 'LR'
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep,
    ranksep,
  })

  nodes.forEach((node) => {
    const label = String(node.data?.label || node.data?.name || '')
    const isClassNode = node.type === 'classNode'
    const isCondition = node.data?.type === 'condition'
    
    let width = Math.max(180, label.length * 8 + 40)
    let height = 44
    
    if (isClassNode) {
      width = 240
      const propertiesCount = Array.isArray(node.data?.properties) ? node.data.properties.length : 0
      const methodsCount = Array.isArray(node.data?.methods) ? node.data.methods.length : 0
      height = 60 + Math.max(1, propertiesCount) * 16 + Math.max(1, methodsCount) * 16 + 20
    } else if (isCondition) {
      width = Math.max(180, label.length * 6 + 60)
      height = Math.max(90, Math.min(130, width * 0.55))
    }
    dagreGraph.setNode(node.id, { width, height })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id) || { x: 0, y: 0 }
    const label = String(node.data?.label || node.data?.name || '')
    const isClassNode = node.type === 'classNode'
    const isCondition = node.data?.type === 'condition'
    
    let width = Math.max(180, label.length * 8 + 40)
    let height = 44
    
    if (isClassNode) {
      width = 240
      const propertiesCount = Array.isArray(node.data?.properties) ? node.data.properties.length : 0
      const methodsCount = Array.isArray(node.data?.methods) ? node.data.methods.length : 0
      height = 60 + Math.max(1, propertiesCount) * 16 + Math.max(1, methodsCount) * 16 + 20
    } else if (isCondition) {
      width = Math.max(180, label.length * 6 + 60)
      height = Math.max(90, Math.min(130, width * 0.55))
    }
    
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      data: {
        ...node.data,
        width,
        height
      },
      position: {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2 + 80,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}
