import { Position } from '@xyflow/react'
import type { Template } from '../types'

export type { Template }

export const CONDITIONAL_TEMPLATES: Record<string, Template> = {
  ifelse: {
    name: 'Basic If-Else Structure',
    description: 'Classic conditional structure with True and False branches.',
    nodes: [
      {
        id: 'start',
        type: 'customNode',
        position: { x: 250, y: 20 },
        data: { label: 'Evaluate (x > 10)', type: 'start' },
        sourcePosition: Position.Bottom
      },
      {
        id: 'condition',
        type: 'customNode',
        position: { x: 250, y: 120 },
        data: { label: 'Is the condition true?', type: 'condition' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'then-branch',
        type: 'customNode',
        position: { x: 80, y: 240 },
        data: { label: 'Execute THEN block (True)', type: 'action' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'else-branch',
        type: 'customNode',
        position: { x: 420, y: 240 },
        data: { label: 'Execute ELSE block (False)', type: 'action' },
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
        label: 'TRUE',
        type: 'smoothstep',
        style: { stroke: '#10b981', strokeWidth: 2 },
        labelStyle: { fill: '#10b981', fontWeight: 'bold' }
      },
      {
        id: 'e-3',
        source: 'condition',
        target: 'else-branch',
        label: 'FALSE',
        type: 'smoothstep',
        style: { stroke: '#f43f5e', strokeWidth: 2 },
        labelStyle: { fill: '#f43f5e', fontWeight: 'bold' }
      }
    ]
  },
  switchcase: {
    name: 'Switch-Case Structure',
    description: 'Multi-way branch based on an expression value.',
    nodes: [
      {
        id: 'start',
        type: 'customNode',
        position: { x: 250, y: 20 },
        data: { label: 'Switch (color)', type: 'start' },
        sourcePosition: Position.Bottom
      },
      {
        id: 'case-red',
        type: 'customNode',
        position: { x: 50, y: 140 },
        data: { label: 'Case "Red"', type: 'condition' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'case-blue',
        type: 'customNode',
        position: { x: 250, y: 140 },
        data: { label: 'Case "Blue"', type: 'condition' },
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
        data: { label: 'Show red background', type: 'action' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'action-blue',
        type: 'customNode',
        position: { x: 250, y: 260 },
        data: { label: 'Show blue background', type: 'action' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'action-default',
        type: 'customNode',
        position: { x: 450, y: 260 },
        data: { label: 'Show white background', type: 'action' },
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
    name: 'Ternary Operator',
    description: 'Condensed conditional expression in the form (condition ? expr1 : expr2).',
    nodes: [
      {
        id: 'start',
        type: 'customNode',
        position: { x: 250, y: 20 },
        data: { label: 'Evaluate: (isMember ? 2.00 : 10.00)', type: 'start' },
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
        data: { label: 'Return 2.00', type: 'action' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'val-false',
        type: 'customNode',
        position: { x: 420, y: 240 },
        data: { label: 'Return 10.00', type: 'action' },
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
        label: 'TRUE (?)',
        type: 'smoothstep',
        style: { stroke: '#10b981', strokeWidth: 2 },
        labelStyle: { fill: '#10b981', fontWeight: 'bold' }
      },
      {
        id: 'e-3',
        source: 'condition',
        target: 'val-false',
        label: 'FALSE (:)',
        type: 'smoothstep',
        style: { stroke: '#f43f5e', strokeWidth: 2 },
        labelStyle: { fill: '#f43f5e', fontWeight: 'bold' }
      }
    ]
  }
}
