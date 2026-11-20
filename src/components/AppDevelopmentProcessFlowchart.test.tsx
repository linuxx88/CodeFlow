import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { AppDevelopmentProcessFlowchart } from './AppDevelopmentProcessFlowchart'

vi.mock('@xyflow/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@xyflow/react')>()
  return {
    ...actual,
    ReactFlow: ({ nodes, children }: any) => (
      <div data-testid="react-flow-mock">
        {Array.isArray(nodes) && nodes.map((n: any) => (
          <div key={n.id} data-testid={`rf-node-${n.id}`}>
            {n.data?.label}
          </div>
        ))}
        {children}
      </div>
    ),
    Background: () => null,
    Controls: () => null,
    useReactFlow: () => ({ fitView: vi.fn() }),
    useNodes: () => []
  }
})

describe('AppDevelopmentProcessFlowchart Component', () => {
  it('renders Live Project Lifecycle nodes immediately on mount when scanData is provided', () => {
    const scanData = {
      dependencies: {
        nodes: [
          { id: 'src/App.tsx', type: 'file' },
          { id: 'src/index.css', type: 'file' },
          { id: 'react', type: 'package' }
        ],
        links: [{ source: 'src/App.tsx', target: 'react', type: 'external' }]
      },
      classes: [{ file: 'src/App.tsx', items: [{ name: 'Demo', properties: [], methods: [] }] }],
      algorithms: [{ file: 'src/App.tsx', items: [{ name: 'run', steps: [] }] }],
      conditionals: [],
      loops: [],
      git: {
        hotspots: [{ file: 'src/App.tsx', commits: 17, authors: 2, score: 34 }]
      }
    }

    render(<AppDevelopmentProcessFlowchart scanData={scanData} />)

    expect(screen.getByText('Live Project Lifecycle')).toBeInTheDocument()
    expect(screen.getByText('Live metrics: 2 files, 1 links, 0 cycles, 1 functions, 1 classes.')).toBeInTheDocument()
    // Canvas should immediately show live scan metrics, NOT Agile Cycle (Demo) nodes
    expect(screen.getByText('1. Scan: 2 source files indexed')).toBeInTheDocument()
    expect(screen.getByText('2. Architecture: 1 packages, 1 edges, 0 cycles')).toBeInTheDocument()
    expect(screen.getByText('4. Git Activity: Top hotspot src/App.tsx (17 commits)')).toBeInTheDocument()
    expect(screen.queryByText('1. Planning & Analysis')).not.toBeInTheDocument()
  })
})
