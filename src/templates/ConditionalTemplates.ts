import type { Node, Edge } from '@xyflow/react'
import { Position } from '@xyflow/react'

export interface Template {
  name: string
  description: string
  nodes: Node[]
  edges: Edge[]
}

export const CONDITIONAL_TEMPLATES: Record<string, Template> = {
  ifelse: {
    name: 'Structure If-Else de Base',
    description: 'Structure conditionnelle classique avec branche Vrai et branche Faux.',
    nodes: [
      {
        id: 'start',
        type: 'customNode',
        position: { x: 250, y: 20 },
        data: { label: 'Évaluer (x > 10)', type: 'start' },
        sourcePosition: Position.Bottom
      },
      {
        id: 'condition',
        type: 'customNode',
        position: { x: 250, y: 120 },
        data: { label: 'La condition est-elle vraie ?', type: 'condition' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'then-branch',
        type: 'customNode',
        position: { x: 80, y: 240 },
        data: { label: 'Exécuter bloc THEN (Vrai)', type: 'action' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'else-branch',
        type: 'customNode',
        position: { x: 420, y: 240 },
        data: { label: 'Exécuter bloc ELSE (Faux)', type: 'action' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      }
    ],
    edges: [
      {
        id: 'e-1',
        source: 'start',
        target: 'condition',
        type: 'smoothstep',
        animated: true,
        style: { stroke: 'var(--accent)' }
      },
      {
        id: 'e-2',
        source: 'condition',
        target: 'then-branch',
        label: 'VRAI',
        type: 'smoothstep',
        style: { stroke: '#10b981', strokeWidth: 2 },
        labelStyle: { fill: '#10b981', fontWeight: 'bold' }
      },
      {
        id: 'e-3',
        source: 'condition',
        target: 'else-branch',
        label: 'FAUX',
        type: 'smoothstep',
        style: { stroke: '#f43f5e', strokeWidth: 2 },
        labelStyle: { fill: '#f43f5e', fontWeight: 'bold' }
      }
    ]
  },
  switchcase: {
    name: 'Structure Switch-Case',
    description: 'Sélection multiple basée sur la valeur d\'une expression.',
    nodes: [
      {
        id: 'start',
        type: 'customNode',
        position: { x: 250, y: 20 },
        data: { label: 'Switch (couleur)', type: 'start' },
        sourcePosition: Position.Bottom
      },
      {
        id: 'case-red',
        type: 'customNode',
        position: { x: 50, y: 140 },
        data: { label: 'Case "Rouge"', type: 'condition' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'case-blue',
        type: 'customNode',
        position: { x: 250, y: 140 },
        data: { label: 'Case "Bleu"', type: 'condition' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'case-default',
        type: 'customNode',
        position: { x: 450, y: 140 },
        data: { label: 'Default', type: 'condition' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'action-red',
        type: 'customNode',
        position: { x: 50, y: 260 },
        data: { label: 'Afficher fond rouge', type: 'action' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'action-blue',
        type: 'customNode',
        position: { x: 250, y: 260 },
        data: { label: 'Afficher fond bleu', type: 'action' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'action-default',
        type: 'customNode',
        position: { x: 450, y: 260 },
        data: { label: 'Afficher fond blanc', type: 'action' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      }
    ],
    edges: [
      {
        id: 'e-1',
        source: 'start',
        target: 'case-red',
        type: 'smoothstep',
        style: { stroke: 'var(--accent)' }
      },
      {
        id: 'e-2',
        source: 'start',
        target: 'case-blue',
        type: 'smoothstep',
        style: { stroke: 'var(--accent)' }
      },
      {
        id: 'e-3',
        source: 'start',
        target: 'case-default',
        type: 'smoothstep',
        style: { stroke: 'var(--accent)' }
      },
      {
        id: 'e-4',
        source: 'case-red',
        target: 'action-red',
        label: 'MATCH',
        type: 'smoothstep',
        style: { stroke: '#10b981', strokeWidth: 2 },
        labelStyle: { fill: '#10b981', fontWeight: 'bold' }
      },
      {
        id: 'e-5',
        source: 'case-blue',
        target: 'action-blue',
        label: 'MATCH',
        type: 'smoothstep',
        style: { stroke: '#10b981', strokeWidth: 2 },
        labelStyle: { fill: '#10b981', fontWeight: 'bold' }
      },
      {
        id: 'e-6',
        source: 'case-default',
        target: 'action-default',
        label: 'MATCH',
        type: 'smoothstep',
        style: { stroke: '#10b981', strokeWidth: 2 },
        labelStyle: { fill: '#10b981', fontWeight: 'bold' }
      }
    ]
  },
  ternary: {
    name: 'Opérateur Ternaire',
    description: 'Expression conditionnelle condensée sous forme (condition ? expr1 : expr2).',
    nodes: [
      {
        id: 'start',
        type: 'customNode',
        position: { x: 250, y: 20 },
        data: { label: 'Calculer : (isMember ? 2.00 : 10.00)', type: 'start' },
        sourcePosition: Position.Bottom
      },
      {
        id: 'condition',
        type: 'customNode',
        position: { x: 250, y: 120 },
        data: { label: 'isMember ?', type: 'condition' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'val-true',
        type: 'customNode',
        position: { x: 80, y: 240 },
        data: { label: 'Retourner 2.00', type: 'action' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'val-false',
        type: 'customNode',
        position: { x: 420, y: 240 },
        data: { label: 'Retourner 10.00', type: 'action' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      }
    ],
    edges: [
      {
        id: 'e-1',
        source: 'start',
        target: 'condition',
        type: 'smoothstep',
        animated: true,
        style: { stroke: 'var(--accent)' }
      },
      {
        id: 'e-2',
        source: 'condition',
        target: 'val-true',
        label: 'VRAI (?)',
        type: 'smoothstep',
        style: { stroke: '#10b981', strokeWidth: 2 },
        labelStyle: { fill: '#10b981', fontWeight: 'bold' }
      },
      {
        id: 'e-3',
        source: 'condition',
        target: 'val-false',
        label: 'FAUX (:)',
        type: 'smoothstep',
        style: { stroke: '#f43f5e', strokeWidth: 2 },
        labelStyle: { fill: '#f43f5e', fontWeight: 'bold' }
      }
    ]
  }
}
