import { describe, it, expect } from 'vitest'
import { findCycles } from './projectUtils'

describe('findCycles (Tarjan SCC algorithm)', () => {
  it('should return no cycles for an empty graph', () => {
    const result = findCycles([], [])
    expect(result.cycleNodes.size).toBe(0)
    expect(result.cycleEdges.size).toBe(0)
    expect(result.sccs.length).toBe(0)
  })

  it('should return no cycles for a single node', () => {
    const nodes = [{ id: 'A' }]
    const result = findCycles(nodes, [])
    expect(result.cycleNodes.size).toBe(0)
    expect(result.cycleEdges.size).toBe(0)
    expect(result.sccs.length).toBe(0)
  })

  it('should return no cycles for a DAG (directed acyclic graph)', () => {
    const nodes = [{ id: 'A' }, { id: 'B' }, { id: 'C' }]
    const links = [
      { source: 'A', target: 'B' },
      { source: 'B', target: 'C' }
    ]
    const result = findCycles(nodes, links)
    expect(result.cycleNodes.size).toBe(0)
    expect(result.cycleEdges.size).toBe(0)
    expect(result.sccs.length).toBe(0)
  })

  it('should detect a simple 2-node cycle', () => {
    const nodes = [{ id: 'A' }, { id: 'B' }]
    const links = [
      { source: 'A', target: 'B' },
      { source: 'B', target: 'A' }
    ]
    const result = findCycles(nodes, links)
    expect(result.cycleNodes.has('A')).toBe(true)
    expect(result.cycleNodes.has('B')).toBe(true)
    expect(result.cycleEdges.has('A->B')).toBe(true)
    expect(result.cycleEdges.has('B->A')).toBe(true)
    expect(result.sccs.length).toBe(1)
    expect(result.sccs[0]).toContain('A')
    expect(result.sccs[0]).toContain('B')
  })

  it('should detect self-loops', () => {
    const nodes = [{ id: 'A' }]
    const links = [{ source: 'A', target: 'A' }]
    const result = findCycles(nodes, links)
    expect(result.cycleNodes.has('A')).toBe(true)
    expect(result.cycleEdges.has('A->A')).toBe(true)
    expect(result.sccs.length).toBe(1)
    expect(result.sccs[0]).toEqual(['A'])
  })

  it('should detect multiple independent cycles and SCCs', () => {
    // A -> B -> A (Cycle 1)
    // C -> D -> C (Cycle 2)
    // A -> C (Bridge, not in cycle)
    const nodes = [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }]
    const links = [
      { source: 'A', target: 'B' },
      { source: 'B', target: 'A' },
      { source: 'A', target: 'C' },
      { source: 'C', target: 'D' },
      { source: 'D', target: 'C' }
    ]
    const result = findCycles(nodes, links)
    expect(result.cycleNodes.size).toBe(4)
    expect(result.cycleNodes.has('A')).toBe(true)
    expect(result.cycleNodes.has('B')).toBe(true)
    expect(result.cycleNodes.has('C')).toBe(true)
    expect(result.cycleNodes.has('D')).toBe(true)
    expect(result.cycleEdges.has('A->B')).toBe(true)
    expect(result.cycleEdges.has('B->A')).toBe(true)
    expect(result.cycleEdges.has('C->D')).toBe(true)
    expect(result.cycleEdges.has('D->C')).toBe(true)
    expect(result.cycleEdges.has('A->C')).toBe(false) // Bridge edge
    expect(result.sccs.length).toBe(2)
  })
})
