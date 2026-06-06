import type { Node, Edge } from '@xyflow/react'
import { Position } from '@xyflow/react'

export interface ProcessTemplate {
  name: string
  description: string
  nodes: Node[]
  edges: Edge[]
}

export const PROCESS_TEMPLATES: Record<string, ProcessTemplate> = {
  agile: {
    name: 'Cycle Agile (Démo)',
    description: 'Étapes classiques de développement logiciel Agile.',
    nodes: [
      {
        id: 'stage-plan',
        type: 'customNode',
        position: { x: 250, y: 20 },
        data: { label: '1. Planification & Cahier des charges', type: 'start' },
        sourcePosition: Position.Bottom
      },
      {
        id: 'stage-design',
        type: 'customNode',
        position: { x: 250, y: 120 },
        data: { label: '2. Architecture & Choix technologiques', type: 'condition' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'stage-code',
        type: 'customNode',
        position: { x: 250, y: 220 },
        data: { label: '3. Développement & Tests Unitaires', type: 'action' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'stage-scan',
        type: 'customNode',
        position: { x: 250, y: 320 },
        data: { label: '4. Audit de Code & Optimisations', type: 'action' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'stage-deploy',
        type: 'customNode',
        position: { x: 250, y: 420 },
        data: { label: '5. Production & Supervision', type: 'action' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      }
    ],
    edges: [
      { id: 'e-1', source: 'stage-plan', target: 'stage-design', type: 'smoothstep', style: { stroke: 'var(--accent)' } },
      { id: 'e-2', source: 'stage-design', target: 'stage-code', type: 'smoothstep', style: { stroke: 'var(--accent)' } },
      { id: 'e-3', source: 'stage-code', target: 'stage-scan', type: 'smoothstep', style: { stroke: 'var(--accent)' } },
      { id: 'e-4', source: 'stage-scan', target: 'stage-deploy', type: 'smoothstep', style: { stroke: 'var(--accent)' } }
    ]
  }
}
