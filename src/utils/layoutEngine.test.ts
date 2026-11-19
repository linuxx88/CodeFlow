import { describe, it, expect, vi } from 'vitest'
import { MarkerType, Position } from '@xyflow/react'
import type { Edge, Node } from '@xyflow/react'
import {
  DagreLayoutEngine,
  ElkLayoutEngine,
  PythonLayoutEngine,
  LayoutManager,
  getNodeDimensions,
} from './layoutEngine'
import { getLayoutedElements } from './layoutUtils'

const makeNode = (id: string, label = id, extraData: Record<string, unknown> = {}): Node => ({
  id,
  type: 'customNode',
  position: { x: 0, y: 0 },
  data: { label, type: 'action', ...extraData },
})

const assertNoBoundingBoxOverlaps = (nodes: Node[]) => {
  const boxes = nodes.map((n) => {
    const dims = getNodeDimensions(n)
    const width = typeof n.data?.width === 'number' ? n.data.width : dims.width
    const height = typeof n.data?.height === 'number' ? n.data.height : dims.height
    return {
      id: n.id,
      x1: n.position.x,
      y1: n.position.y,
      x2: n.position.x + width,
      y2: n.position.y + height,
    }
  })

  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i]
      const b = boxes[j]
      const overlapsX = a.x1 < b.x2 && a.x2 > b.x1
      const overlapsY = a.y1 < b.y2 && a.y2 > b.y1
      expect(
        overlapsX && overlapsY,
        `Nodes "${a.id}" (${a.x1},${a.y1}..${a.x2},${a.y2}) and "${b.id}" (${b.x1},${b.y1}..${b.x2},${b.y2}) overlap`
      ).toBe(false)
    }
  }
}

describe('layoutEngine', () => {
  describe('getNodeDimensions', () => {
    it('computes dimensions for action, condition, fileNode, and classNode', () => {
      const actionDims = getNodeDimensions(makeNode('a', 'Short'))
      expect(actionDims.width).toBeGreaterThanOrEqual(180)
      expect(actionDims.height).toBeGreaterThanOrEqual(68)

      const multilineDims = getNodeDimensions(makeNode('m', 'Line 1\nLine 2\nLine 3'))
      expect(multilineDims.height).toBeGreaterThan(actionDims.height)

      const condDims = getNodeDimensions(makeNode('c', 'x > 10 && y < 20', { type: 'condition' }))
      expect(condDims.width).toBeGreaterThanOrEqual(200)
      expect(condDims.height).toBeGreaterThanOrEqual(110)

      const fileDims = getNodeDimensions({
        id: 'f',
        type: 'fileNode',
        position: { x: 0, y: 0 },
        data: { label: 'src/utils/layoutEngine.ts' },
      })
      expect(fileDims.width).toBeGreaterThanOrEqual(180)
      expect(fileDims.width).toBeLessThanOrEqual(280)
      expect(fileDims.height).toBe(62)

      const classDims = getNodeDimensions({
        id: 'cls',
        type: 'classNode',
        position: { x: 0, y: 0 },
        data: { name: 'User', properties: ['id', 'name'], methods: ['login'] },
      })
      expect(classDims.width).toBeGreaterThanOrEqual(240)
      expect(classDims.height).toBeGreaterThanOrEqual(130)
    })
  })

  describe('DagreLayoutEngine', () => {
    const engine = new DagreLayoutEngine()

    it('handles empty graph', () => {
      expect(engine.layout([], [], { direction: 'TB', nodesep: 50, ranksep: 80 })).toEqual({
        nodes: [],
        edges: [],
      })
    })

    it('lays out nodes without overlaps in TB and LR including disconnected/large nodes', () => {
      const nodes: Node[] = [
        makeNode('n1', 'Start of flow', { type: 'start' }),
        makeNode('n2', 'Very long condition expression that wraps across lines', { type: 'condition' }),
        makeNode('n3', 'Action branch A\nwith second line'),
        makeNode('n4', 'Action branch B'),
        {
          id: 'cls1',
          type: 'classNode',
          position: { x: 0, y: 0 },
          data: { name: 'IsolatedService', properties: ['a', 'b', 'c'], methods: ['run', 'stop'] },
        },
      ]
      const edges: Edge[] = [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
        { id: 'e3', source: 'n2', target: 'n4' },
        { id: 'e-dangling', source: 'n1', target: 'missing' },
      ]

      const lrRes = engine.layout(nodes, edges, { direction: 'LR', nodesep: 40, ranksep: 80 })
      expect(lrRes.nodes[0].sourcePosition).toBe(Position.Right)
      expect(lrRes.edges[0].markerEnd).toEqual({ type: MarkerType.ArrowClosed })
      assertNoBoundingBoxOverlaps(lrRes.nodes)

      const tbRes = engine.layout(nodes, edges, { direction: 'TB', nodesep: 40, ranksep: 80 })
      expect(tbRes.nodes[0].sourcePosition).toBe(Position.Bottom)
      assertNoBoundingBoxOverlaps(tbRes.nodes)
    })
  })

  describe('ElkLayoutEngine', () => {
    it('lays out nodes asynchronously without overlaps in TB and LR', async () => {
      const engine = new ElkLayoutEngine()
      const nodes: Node[] = [
        makeNode('a', 'Alpha', { type: 'start' }),
        makeNode('b', 'Beta condition check', { type: 'condition' }),
        makeNode('c', 'Gamma action'),
        makeNode('d', 'Isolated node'),
      ]
      const edges: Edge[] = [
        { id: 'e1', source: 'a', target: 'b' },
        { id: 'e2', source: 'b', target: 'c' },
        { id: 'e-bad', source: 'missing', target: 'b' },
      ]

      const tbRes = await engine.layout(nodes, edges, { direction: 'TB', nodesep: 40, ranksep: 80 })
      expect(tbRes.nodes[0].sourcePosition).toBe(Position.Bottom)
      assertNoBoundingBoxOverlaps(tbRes.nodes)

      const lrRes = await engine.layout(nodes, edges, { direction: 'LR', nodesep: 40, ranksep: 80 })
      expect(lrRes.nodes[0].sourcePosition).toBe(Position.Right)
      assertNoBoundingBoxOverlaps(lrRes.nodes)
    })

    it('falls back to Dagre when ELK throws', async () => {
      const engine = new ElkLayoutEngine()
      ;(engine as unknown as { elkInstance: { layout: () => Promise<never> } }).elkInstance = {
        layout: vi.fn().mockRejectedValue(new Error('ELK failure')),
      }
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const nodes = [makeNode('a'), makeNode('b')]
      const edges: Edge[] = [{ id: 'e1', source: 'a', target: 'b' }]
      const res = await engine.layout(nodes, edges, { direction: 'TB', nodesep: 40, ranksep: 80 })

      expect(res.nodes).toHaveLength(2)
      assertNoBoundingBoxOverlaps(res.nodes)
      expect(errSpy).toHaveBeenCalled()
      errSpy.mockRestore()
    })
  })

  describe('PythonLayoutEngine', () => {
    const engine = new PythonLayoutEngine()

    it('assigns longest-path levels and avoids overlaps across levels and mixed node sizes', () => {
      const nodes = [
        makeNode('a', 'A', { type: 'start' }),
        makeNode('b', 'B', { type: 'action' }),
        makeNode('c', 'Long condition C with wrapping text', { type: 'condition' }),
        makeNode('d', 'D'),
        {
          id: 'cls',
          type: 'classNode',
          position: { x: 0, y: 0 },
          data: { name: 'BigClass', properties: ['p1', 'p2', 'p3'], methods: ['m1', 'm2'] },
        },
      ]
      const edges: Edge[] = [
        { id: 'e1', source: 'a', target: 'b' },
        { id: 'e2', source: 'a', target: 'c' },
        { id: 'e3', source: 'b', target: 'c' },
        { id: 'e4', source: 'b', target: 'd' },
      ]

      const tbRes = engine.layout(nodes, edges, { direction: 'TB', nodesep: 40, ranksep: 60 })
      assertNoBoundingBoxOverlaps(tbRes.nodes)

      const lrRes = engine.layout(nodes, edges, { direction: 'LR', nodesep: 40, ranksep: 60 })
      assertNoBoundingBoxOverlaps(lrRes.nodes)
    })

    it('terminates cleanly on cyclic graphs without overlaps', () => {
      const nodes = [makeNode('x'), makeNode('y')]
      const edges: Edge[] = [
        { id: 'e1', source: 'x', target: 'y' },
        { id: 'e2', source: 'y', target: 'x' },
      ]
      const res = engine.layout(nodes, edges, { direction: 'LR', nodesep: 40, ranksep: 80 })
      expect(res.nodes).toHaveLength(2)
      assertNoBoundingBoxOverlaps(res.nodes)
    })
  })

  describe('LayoutManager and getLayoutedElements', () => {
    it('supports all layout types and helper wrapper', async () => {
      const manager = new LayoutManager()
      const nodes = [makeNode('1'), makeNode('2')]
      const edges: Edge[] = [{ id: 'e1', source: '1', target: '2' }]

      const dagreRes = await manager.layout('dagre', nodes, edges, {
        direction: 'LR',
        nodesep: 50,
        ranksep: 100,
      })
      expect(dagreRes.nodes).toHaveLength(2)
      assertNoBoundingBoxOverlaps(dagreRes.nodes)

      const helperRes = getLayoutedElements(nodes, edges, 'TB')
      expect(helperRes.nodes[0].sourcePosition).toBe(Position.Bottom)
      assertNoBoundingBoxOverlaps(helperRes.nodes)
    })
  })
})
