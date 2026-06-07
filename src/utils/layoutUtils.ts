import { DagreLayoutEngine } from './layoutEngine'
import type { Node, Edge } from '@xyflow/react'

export const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = 'LR',
  nodesep = 80,
  ranksep = 120
) => {
  const engine = new DagreLayoutEngine()
  return engine.layout(nodes, edges, {
    direction: direction as 'LR' | 'TB',
    nodesep,
    ranksep,
  }) as { nodes: Node[]; edges: Edge[] }
}

