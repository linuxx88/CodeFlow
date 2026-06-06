import type { Node, Edge } from '@xyflow/react'
import { Position } from '@xyflow/react'

export interface LoopTemplate {
  name: string
  description: string
  nodes: Node[]
  edges: Edge[]
}

export const LOOP_TEMPLATES: Record<string, LoopTemplate> = {
  basicWhile: {
    name: 'Boucle While Classique',
    description: 'Structure de boucle simple avec condition d\'arrêt et retour arrière.',
    nodes: [
      {
        id: 'start',
        type: 'customNode',
        position: { x: 250, y: 20 },
        data: { label: 'Initialiser : i = 0', type: 'start' },
        sourcePosition: Position.Bottom
      },
      {
        id: 'condition',
        type: 'customNode',
        position: { x: 250, y: 120 },
        data: { label: 'Tant que : i < 5 ?', type: 'condition' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'body',
        type: 'customNode',
        position: { x: 80, y: 240 },
        data: { label: 'Exécuter : print(i); i++', type: 'action' },
        sourcePosition: Position.Top,
        targetPosition: Position.Top
      },
      {
        id: 'exit',
        type: 'customNode',
        position: { x: 420, y: 240 },
        data: { label: 'Sortie de Boucle', type: 'action' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      }
    ],
    edges: [
      {
        id: 'e-start-cond',
        source: 'start',
        target: 'condition',
        type: 'smoothstep',
        style: { stroke: 'var(--accent)' }
      },
      {
        id: 'e-cond-body',
        source: 'condition',
        target: 'body',
        label: 'VRAI',
        type: 'smoothstep',
        style: { stroke: '#10b981', strokeWidth: 2 },
        labelStyle: { fill: '#10b981', fontWeight: 'bold' }
      },
      {
        id: 'e-cond-exit',
        source: 'condition',
        target: 'exit',
        label: 'FAUX',
        type: 'smoothstep',
        style: { stroke: '#f43f5e', strokeWidth: 2 },
        labelStyle: { fill: '#f43f5e', fontWeight: 'bold' }
      },
      {
        id: 'e-body-cond',
        source: 'body',
        target: 'condition',
        label: 'BOUCLER',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#eab308', strokeWidth: 2, strokeDasharray: '4 4' },
        labelStyle: { fill: '#eab308', fontWeight: 'bold' }
      }
    ]
  }
}
