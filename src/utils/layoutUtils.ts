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
    const width = isClassNode ? 240 : Math.max(180, label.length * 8 + 40)
    const height = isClassNode ? 180 : 44
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
    const width = isClassNode ? 240 : Math.max(180, label.length * 8 + 40)
    const height = isClassNode ? 180 : 44
    
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}
