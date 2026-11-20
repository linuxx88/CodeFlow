import { Position } from '@xyflow/react'
import type { Template } from '../types'

export type RepeatTemplate = Template

export const REPEAT_TEMPLATES: Record<string, RepeatTemplate> = {
  basicRepeat: {
    name: 'Repeat Loop (Do-While)',
    description: 'Do-while loop structure (executes body before checking condition).',
    nodes: [
      {
        id: 'start',
        type: 'customNode',
        position: { x: 250, y: 20 },
        data: { label: 'Initialize: i = 0', type: 'start', badgeLabel: 'Entry' },
        sourcePosition: Position.Bottom
      },
      {
        id: 'body',
        type: 'customNode',
        position: { x: 250, y: 120 },
        data: { label: 'Execute loop body: i++', type: 'action', badgeLabel: 'Loop Body' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'condition',
        type: 'customNode',
        position: { x: 250, y: 240 },
        data: { label: 'Condition: i < 5 ?', type: 'condition', badgeLabel: 'Loop Check' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'exit',
        type: 'customNode',
        position: { x: 420, y: 360 },
        data: { label: 'Exit Loop', type: 'action', badgeLabel: 'Exit' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      }
    ],
    edges: [
      {
        id: 'e-start-body',
        source: 'start',
        target: 'body',
        type: 'smoothstep',
        style: { stroke: 'var(--accent)' }
      },
      {
        id: 'e-body-cond',
        source: 'body',
        target: 'condition',
        type: 'smoothstep',
        style: { stroke: 'var(--accent)' }
      },
      {
        id: 'e-cond-exit',
        source: 'condition',
        target: 'exit',
        label: 'FALSE',
        type: 'smoothstep',
        style: { stroke: '#f43f5e', strokeWidth: 2 },
        labelStyle: { fill: '#f43f5e', fontWeight: 'bold' }
      },
      {
        id: 'e-cond-body-loop',
        source: 'condition',
        target: 'body',
        label: 'TRUE (LOOP)',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2, strokeDasharray: '4 4' },
        labelStyle: { fill: '#10b981', fontWeight: 'bold' }
      }
    ]
  }
}
