import { describe, it, expect } from 'vitest'
import { validateNodesForView } from './flowchartValidator'
import type { FlowchartView } from '../constants/views'

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

  it('handles class-diagram with string and array inherits without throwing', () => {
    const res = validateNodesForView('class-diagram', {
      classes: [
        {
          file: 'models.ts',
          items: [
            { name: 'Base', inherits: null, properties: ['id'], methods: [] },
            { name: 'Child', inherits: 'Base', properties: [], methods: ['save'] },
            { name: 'Multi', inherits: ['Base', 'Child'], properties: [], methods: [] },
          ],
        },
      ],
    })
    expect(res.isValid).toBe(true)
  })

  it('returns invalid result for unknown view', () => {
    const res = validateNodesForView('unknown-view' as FlowchartView, null)
    expect(res.isValid).toBe(false)
    expect(res.message).toContain('Unrecognized or corrupted view')
  })
})
