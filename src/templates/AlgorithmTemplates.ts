import { Position } from '@xyflow/react'
import type { Template } from '../types'

export type AlgoTemplate = Template

export const ALGO_TEMPLATES: Record<string, AlgoTemplate> = {
  demo: {
    name: 'Sum of Elements (Demo)',
    description: 'Simple list summation algorithm.',
    nodes: [
      {
        id: 'start',
        type: 'customNode',
        position: { x: 250, y: 20 },
        data: { label: 'Start: calculateSum(list)', type: 'start', badgeLabel: 'Function' },
        sourcePosition: Position.Bottom
      },
      {
        id: 'step-0',
        type: 'customNode',
        position: { x: 250, y: 120 },
        data: { label: 'Initialize total = 0', type: 'action', badgeLabel: 'Step' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'step-1',
        type: 'customNode',
        position: { x: 250, y: 220 },
        data: { label: 'For each element in list: total += element', type: 'action', badgeLabel: 'Step' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'step-2',
        type: 'customNode',
        position: { x: 250, y: 320 },
        data: { label: 'Return total', type: 'action', badgeLabel: 'Step' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      }
    ],
    edges: [
      {
        id: 'e-1',
        source: 'start',
        target: 'step-0',
        type: 'smoothstep',
        style: { stroke: 'var(--accent)' }
      },
      {
        id: 'e-2',
        source: 'step-0',
        target: 'step-1',
        type: 'smoothstep',
        style: { stroke: 'var(--accent)' }
      },
      {
        id: 'e-3',
        source: 'step-1',
        target: 'step-2',
        type: 'smoothstep',
        style: { stroke: 'var(--accent)' }
      }
    ]
  }
}
