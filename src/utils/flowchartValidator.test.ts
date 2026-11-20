import { describe, it, expect } from 'vitest'
import { validateNodesForView } from './flowchartValidator'
import { buildClassTemplates, buildProcessTemplates } from './templateBuilders'
import { getNodeDimensions } from './layoutEngine'
import type { Node } from '@xyflow/react'
import type { FlowchartView } from '../constants/views'

const assertNoOverlaps = (nodes: Node[]) => {
  const boxes = nodes.map((n) => {
    const dims = getNodeDimensions(n)
    return {
      id: n.id,
      x1: n.position.x,
      y1: n.position.y,
      x2: n.position.x + dims.width,
      y2: n.position.y + dims.height,
    }
  })

  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i]
      const b = boxes[j]
      expect(a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1).toBe(false)
    }
  }
}

describe('flowchartValidator', () => {
  it('validates all standard views with empty scanData', () => {
    const views: FlowchartView[] = [
      'conditional-statement',
      'while-loop',
      'repeat-loop',
      'algo',
      'python-flowchart',
      'process-flowchart',
      'class-diagram',
    ]

    for (const view of views) {
      const res = validateNodesForView(view, null)
      expect(res.isValid).toBe(true)
    }
  })

  it('handles class-diagram with string and array inherits without throwing or overlapping', () => {
    const scanData = {
      classes: [
        {
          file: 'models.ts',
          items: [
            { name: 'Base', inherits: null, properties: ['id'], methods: [] },
            { name: 'Child', inherits: 'Base', properties: [], methods: ['save'] },
            { name: 'Multi', inherits: ['Base', 'Child'], properties: [], methods: [] },
            { name: 'Fourth', inherits: 'Base', properties: [], methods: [] },
          ],
        },
      ],
    }

    const res = validateNodesForView('class-diagram', scanData)
    expect(res.isValid).toBe(true)

    const built = buildClassTemplates(scanData)
    expect(built['project-models.ts'].nodes).toHaveLength(4)
    expect(built['project-models.ts'].edges.length).toBeGreaterThanOrEqual(3)
    assertNoOverlaps(built['project-models.ts'].nodes)
  })

  it('builds process lifecycle template with live scan metrics and without overlapping nodes', () => {
    const built = buildProcessTemplates({
      dependencies: {
        nodes: [{ id: 'a.ts', type: 'file' }, { id: 'b.ts', type: 'file' }, { id: 'react', type: 'package' }],
        links: [
          { source: 'a.ts', target: 'b.ts' },
          { source: 'b.ts', target: 'a.ts' },
          { source: 'a.ts', target: 'react' },
        ],
      },
      git: {
        hotspots: [
          { file: 'README.md', commits: 5 },
          { file: 'src/App.tsx', commits: 17 },
        ],
      },
    })
    const nodes = built['project-lifecycle'].nodes
    expect(nodes).toHaveLength(5)
    expect(nodes[0].data.badgeLabel).toBe('Scan')
    expect(nodes[1].data.badgeLabel).toBe('Architecture')
    expect(String(nodes[1].data.label)).toContain('1 cycles')
    expect(String(nodes[3].data.label)).toContain('src/App.tsx (17 commits)')
    assertNoOverlaps(nodes)
  })

  it('returns invalid result for unknown view', () => {
    const res = validateNodesForView('unknown-view' as FlowchartView, null)
    expect(res.isValid).toBe(false)
    expect(res.message).toContain('Unrecognized or corrupted view')
  })
})
