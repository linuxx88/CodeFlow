import type { Node, Edge } from '@xyflow/react'
import { Position } from '@xyflow/react'

export interface PythonTemplate {
  name: string
  description: string
  nodes: Node[]
  edges: Edge[]
}

export const PYTHON_TEMPLATES: Record<string, PythonTemplate> = {
  pyDemo: {
    name: 'Python Script Structure (Demo)',
    description: 'Example with decorators, try-except block, and main entry point.',
    nodes: [
      {
        id: 'start',
        type: 'customNode',
        position: { x: 250, y: 20 },
        data: { label: '@auth_required: auth decorator', type: 'start' },
        sourcePosition: Position.Bottom
      },
      {
        id: 'try',
        type: 'customNode',
        position: { x: 250, y: 120 },
        data: { label: 'Try Block: run_calculation()', type: 'condition' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'try-success',
        type: 'customNode',
        position: { x: 80, y: 240 },
        data: { label: 'Success: print("Calculation complete")', type: 'action' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'try-except',
        type: 'customNode',
        position: { x: 420, y: 240 },
        data: { label: 'Except ZeroDivisionError: print("Error")', type: 'action' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'main-entry',
        type: 'customNode',
        position: { x: 250, y: 360 },
        data: { label: 'if __name__ == "__main__": start()', type: 'action' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      }
    ],
    edges: [
      {
        id: 'e-1',
        source: 'start',
        target: 'try',
        type: 'smoothstep',
        style: { stroke: 'var(--accent)' }
      },
      {
        id: 'e-2',
        source: 'try',
        target: 'try-success',
        label: 'TRY',
        type: 'smoothstep',
        style: { stroke: '#10b981', strokeWidth: 2 },
        labelStyle: { fill: '#10b981', fontWeight: 'bold' }
      },
      {
        id: 'e-3',
        source: 'try',
        target: 'try-except',
        label: 'EXCEPT',
        type: 'smoothstep',
        style: { stroke: '#f43f5e', strokeWidth: 2 },
        labelStyle: { fill: '#f43f5e', fontWeight: 'bold' }
      },
      {
        id: 'e-4',
        source: 'try-success',
        target: 'main-entry',
        type: 'smoothstep',
        style: { stroke: 'var(--accent)' }
      }
    ]
  }
}
