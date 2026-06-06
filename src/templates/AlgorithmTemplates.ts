import type { Node, Edge } from '@xyflow/react'
import { Position } from '@xyflow/react'

export interface AlgoTemplate {
  name: string
  description: string
  nodes: Node[]
  edges: Edge[]
}

export const ALGO_TEMPLATES: Record<string, AlgoTemplate> = {
  demo: {
    name: 'Somme d\'Éléments (Démo)',
    description: 'Algorithme simple de sommation de liste.',
    nodes: [
      {
        id: 'start',
        type: 'customNode',
        position: { x: 250, y: 20 },
        data: { label: 'Début: calculateSum(list)', type: 'start' },
        sourcePosition: Position.Bottom
      },
      {
        id: 'step-0',
        type: 'customNode',
        position: { x: 250, y: 120 },
        data: { label: 'Initialiser total = 0', type: 'action' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'step-1',
        type: 'customNode',
        position: { x: 250, y: 220 },
        data: { label: 'Pour chaque element dans list : total += element', type: 'action' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'step-2',
        type: 'customNode',
        position: { x: 250, y: 320 },
        data: { label: 'Retourner total', type: 'action' },
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
