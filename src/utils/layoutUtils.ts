import type { Node, Edge } from '@xyflow/react'
import type { LayoutDirection, LayoutResult } from '../types'
import { DagreLayoutEngine } from './layoutEngine'

const defaultDagreEngine = new DagreLayoutEngine()

export const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction: LayoutDirection = 'LR',
  nodesep = 90,
  ranksep = 180
): LayoutResult => {
  return defaultDagreEngine.layout(nodes, edges, {
    direction,
    nodesep,
    ranksep,
  })
}
