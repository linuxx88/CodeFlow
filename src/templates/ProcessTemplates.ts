import { Position } from '@xyflow/react'
import type { Template } from '../types'

export type ProcessTemplate = Template

export const PROCESS_TEMPLATES: Record<string, ProcessTemplate> = {
  agile: {
    name: 'Agile Cycle (Demo)',
    description: 'Classic Agile software development lifecycle stages.',
    nodes: [
      {
        id: 'stage-plan',
        type: 'customNode',
        position: { x: 250, y: 20 },
        data: { label: '1. Planning & Requirements', type: 'start', badgeLabel: 'Stage 1' },
        sourcePosition: Position.Bottom
      },
      {
        id: 'stage-design',
        type: 'customNode',
        position: { x: 250, y: 120 },
        data: { label: '2. Architecture & Tech Stack', type: 'condition', badgeLabel: 'Stage 2' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'stage-code',
        type: 'customNode',
        position: { x: 250, y: 220 },
        data: { label: '3. Development & Unit Tests', type: 'action', badgeLabel: 'Stage 3' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'stage-scan',
        type: 'customNode',
        position: { x: 250, y: 320 },
        data: { label: '4. Code Audit & Optimization', type: 'action', badgeLabel: 'Stage 4' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'stage-deploy',
        type: 'customNode',
        position: { x: 250, y: 420 },
        data: { label: '5. Production & Monitoring', type: 'action', badgeLabel: 'Stage 5' },
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
