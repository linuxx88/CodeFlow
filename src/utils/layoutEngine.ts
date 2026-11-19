import dagre from '@dagrejs/dagre'
import { MarkerType, Position } from '@xyflow/react'
import type { Node, Edge } from '@xyflow/react'
import type {
  LayoutDirection,
  LayoutEngine,
  LayoutOptions,
  LayoutResult,
  LayoutType,
} from '../types'

export type { LayoutDirection, LayoutEngine, LayoutOptions, LayoutResult, LayoutType }

export interface NodeDimensions {
  width: number
  height: number
}

interface ElkLayoutInstance {
  layout: (graph: Record<string, unknown>) => Promise<{
    children?: Array<{ id: string; x?: number; y?: number }>
  }>
}

const TOP_OFFSET = 80

const estimateWrappedLines = (text: string, charsPerLine: number): number => {
  if (!text) return 1
  const safeChars = Math.max(8, charsPerLine)
  return text
    .split(/\r?\n/)
    .reduce((total, line) => total + Math.max(1, Math.ceil(line.length / safeChars)), 0)
}

export const getNodeDimensions = (node: Node): NodeDimensions => {
  const label = String(node.data?.label || node.data?.name || '')
  const isClassNode = node.type === 'classNode'
  const isFileNode = node.type === 'fileNode' || node.type === 'custom'
  const isCondition = node.data?.type === 'condition'

  if (isClassNode) {
    const inheritsText = Array.isArray(node.data?.inherits)
      ? node.data.inherits.join(', ')
      : String(node.data?.inherits || '')
    const headerLen = label.length + (inheritsText ? inheritsText.length + 12 : 0)
    const width = Math.max(240, Math.min(380, Math.round(headerLen * 7.5 + 90)))
    const propertiesCount = Array.isArray(node.data?.properties) ? node.data.properties.length : 0
    const methodsCount = Array.isArray(node.data?.methods) ? node.data.methods.length : 0
    const propsHeight = 16 + Math.max(1, propertiesCount) * 20
    const methodsHeight = 16 + Math.max(1, methodsCount) * 20
    const height = 46 + Math.min(204, propsHeight + methodsHeight)
    return { width, height }
  }

  if (isFileNode) {
    // Compact 2-line FileNode: filename + badge on line 1, muted folder path on line 2
    const fileName = label.split('/').pop() || label
    const width = Math.min(280, Math.max(180, Math.round(fileName.length * 8 + 90)))
    return { width, height: 62 }
  }

  if (isCondition) {
    const width = Math.max(200, Math.min(360, Math.round(label.length * 6.5 + 90)))
    const innerWidth = Math.max(110, width - 84)
    const lines = estimateWrappedLines(label, Math.floor(innerWidth / 7.5))
    const height = Math.max(110, 84 + lines * 18)
    return { width, height }
  }

  const width = Math.max(180, Math.min(320, Math.round(label.length * 7.8 + 48)))
  const innerWidth = Math.max(120, width - 40)
  const lines = estimateWrappedLines(label, Math.floor(innerWidth / 7.5))
  const height = Math.max(68, 56 + lines * 19)
  return { width, height }
}

const buildDimensionsMap = (nodes: Node[]): Map<string, NodeDimensions> => {
  const dims = new Map<string, NodeDimensions>()
  for (const node of nodes) {
    dims.set(node.id, getNodeDimensions(node))
  }
  return dims
}

const applyNodeLayout = (
  node: Node,
  x: number,
  y: number,
  dims: NodeDimensions,
  isHorizontal: boolean
): Node => ({
  ...node,
  targetPosition: isHorizontal ? Position.Left : Position.Top,
  sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
  data: {
    ...node.data,
    width: dims.width,
    height: dims.height,
  },
  position: {
    x,
    y: y + TOP_OFFSET,
  },
})

const formatLayoutEdges = (edges: Edge[]): Edge[] =>
  edges.map((edge) => ({
    ...edge,
    type: edge.type || 'smoothstep',
    markerEnd: edge.markerEnd || { type: MarkerType.ArrowClosed },
  }))

export class DagreLayoutEngine implements LayoutEngine {
  layout(nodes: Node[], edges: Edge[], options: LayoutOptions): LayoutResult {
    if (nodes.length === 0) return { nodes, edges }

    const dagreGraph = new dagre.graphlib.Graph({ multigraph: true })
    dagreGraph.setDefaultEdgeLabel(() => ({}))

    const isHorizontal = options.direction === 'LR'
    const nodesep = Math.max(40, options.nodesep)
    const ranksep = Math.max(90, options.ranksep)
    dagreGraph.setGraph({
      rankdir: options.direction,
      nodesep,
      ranksep,
      edgesep: Math.max(24, Math.floor(nodesep / 2)),
      acyclicer: 'greedy',
      ranker: 'network-simplex',
      marginx: 40,
      marginy: 40,
    })

    const dimsMap = buildDimensionsMap(nodes)
    const nodeIds = new Set<string>()

    for (const node of nodes) {
      nodeIds.add(node.id)
      const dims = dimsMap.get(node.id)!
      dagreGraph.setNode(node.id, { width: dims.width, height: dims.height })
    }

    edges.forEach((edge, idx) => {
      if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
        dagreGraph.setEdge(edge.source, edge.target, {}, edge.id || `e-${idx}`)
      }
    })

    dagre.layout(dagreGraph)

    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id) || { x: 0, y: 0 }
      const dims = dimsMap.get(node.id)!
      return applyNodeLayout(
        node,
        nodeWithPosition.x - dims.width / 2,
        nodeWithPosition.y - dims.height / 2,
        dims,
        isHorizontal
      )
    })

    return { nodes: layoutedNodes, edges: formatLayoutEdges(edges) }
  }
}

export class ElkLayoutEngine implements LayoutEngine {
  private elkInstance: ElkLayoutInstance | null = null

  async layout(nodes: Node[], edges: Edge[], options: LayoutOptions): Promise<LayoutResult> {
    if (nodes.length === 0) return { nodes, edges }

    const isHorizontal = options.direction === 'LR'

    if (!this.elkInstance) {
      const ELKModule = await import('elkjs/lib/elk.bundled.js')
      // Handle ES6 / CommonJS default export variation
      const ELK = (ELKModule.default || ELKModule) as unknown as new () => ElkLayoutInstance
      this.elkInstance = new ELK()
    }

    const dimsMap = buildDimensionsMap(nodes)
    const nodeIds = new Set(nodes.map((n) => n.id))
    const nodesep = Math.max(40, options.nodesep)
    const ranksep = Math.max(90, options.ranksep)

    const elkNodes = nodes.map((node) => {
      const { width, height } = dimsMap.get(node.id)!
      return { id: node.id, width, height }
    })

    const elkEdges = edges
      .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))
      .map((edge, idx) => ({
        id: edge.id || `e_${edge.source}_${edge.target}_${idx}`,
        sources: [edge.source],
        targets: [edge.target],
      }))

    const graph = {
      id: 'root',
      layoutOptions: {
        'elk.algorithm': 'layered',
        'elk.direction': isHorizontal ? 'RIGHT' : 'DOWN',
        'elk.edgeRouting': 'ORTHOGONAL',
        'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
        'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
        'elk.spacing.nodeNode': String(nodesep),
        'elk.spacing.edgeNode': String(Math.max(24, Math.floor(nodesep / 2))),
        'elk.spacing.componentComponent': String(Math.max(60, nodesep)),
        'elk.layered.spacing.nodeNodeBetweenLayers': String(ranksep),
        'elk.layered.spacing.edgeNodeBetweenLayers': String(Math.max(40, Math.floor(ranksep / 3))),
        'elk.layered.spacing.edgeEdgeBetweenLayers': String(Math.max(20, Math.floor(nodesep / 3))),
      },
      children: elkNodes,
      edges: elkEdges,
    }

    try {
      const layoutedGraph = await this.elkInstance.layout(graph)
      const positionById = new Map<string, { x: number; y: number }>()
      for (const child of layoutedGraph.children ?? []) {
        positionById.set(child.id, { x: child.x ?? 0, y: child.y ?? 0 })
      }

      const layoutedNodes = nodes.map((node) => {
        const pos = positionById.get(node.id) ?? { x: 0, y: 0 }
        const dims = dimsMap.get(node.id)!
        return applyNodeLayout(node, pos.x, pos.y, dims, isHorizontal)
      })

      return { nodes: layoutedNodes, edges: formatLayoutEdges(edges) }
    } catch (error) {
      console.error('ELK layout failed, falling back to Dagre', error)
      return new DagreLayoutEngine().layout(nodes, edges, options)
    }
  }
}

export class PythonLayoutEngine implements LayoutEngine {
  layout(nodes: Node[], edges: Edge[], options: LayoutOptions): LayoutResult {
    if (nodes.length === 0) return { nodes, edges }

    const isHorizontal = options.direction === 'LR'
    const nodesep = Math.max(20, options.nodesep)
    const ranksep = Math.max(40, options.ranksep)
    const dimsMap = buildDimensionsMap(nodes)

    const levels = new Map<string, number>()
    const adj = new Map<string, string[]>()
    const inDegree = new Map<string, number>()
    const visits = new Map<string, number>()

    for (const n of nodes) {
      levels.set(n.id, 0)
      adj.set(n.id, [])
      inDegree.set(n.id, 0)
      visits.set(n.id, 0)
    }

    for (const e of edges) {
      const neighbors = adj.get(e.source)
      if (neighbors && inDegree.has(e.target) && e.source !== e.target) {
        neighbors.push(e.target)
        inDegree.set(e.target, inDegree.get(e.target)! + 1)
      }
    }

    const maxRelaxations = nodes.length
    const propagateFrom = (seeds: string[]) => {
      const queue = [...seeds]
      while (queue.length > 0) {
        const curr = queue.shift()!
        const count = visits.get(curr) ?? 0
        if (count >= maxRelaxations) continue
        visits.set(curr, count + 1)

        const currLevel = levels.get(curr) ?? 0
        for (const next of adj.get(curr) ?? []) {
          const nextLevel = levels.get(next) ?? 0
          if (currLevel + 1 > nextLevel && (visits.get(next) ?? 0) < maxRelaxations) {
            levels.set(next, currLevel + 1)
            queue.push(next)
          } else if ((visits.get(next) ?? 0) === 0) {
            queue.push(next)
          }
        }
      }
    }

    const zeroInDegree = nodes.filter((n) => inDegree.get(n.id) === 0).map((n) => n.id)
    if (zeroInDegree.length > 0) {
      propagateFrom(zeroInDegree)
    }
    for (const n of nodes) {
      if ((visits.get(n.id) ?? 0) === 0) {
        propagateFrom([n.id])
      }
    }

    const nodesByLevel = new Map<number, Node[]>()
    for (const node of nodes) {
      const lvl = levels.get(node.id) ?? 0
      const group = nodesByLevel.get(lvl)
      if (group) {
        group.push(node)
      } else {
        nodesByLevel.set(lvl, [node])
      }
    }

    // Accumulate layer offsets using actual max node width/height per level so layers never overlap
    const sortedLevels = Array.from(nodesByLevel.keys()).sort((a, b) => a - b)
    const positions = new Map<string, { x: number; y: number }>()
    let layerCursor = 0

    for (const lvl of sortedLevels) {
      const levelNodes = nodesByLevel.get(lvl)!
      if (isHorizontal) {
        const maxLevelWidth = Math.max(...levelNodes.map((n) => dimsMap.get(n.id)!.width))
        const totalHeight = levelNodes.reduce(
          (sum, n, idx) => sum + dimsMap.get(n.id)!.height + (idx > 0 ? nodesep : 0),
          0
        )
        let cursorY = -totalHeight / 2 + 200
        for (const n of levelNodes) {
          const { height } = dimsMap.get(n.id)!
          positions.set(n.id, { x: layerCursor, y: cursorY })
          cursorY += height + nodesep
        }
        layerCursor += maxLevelWidth + ranksep
      } else {
        const maxLevelHeight = Math.max(...levelNodes.map((n) => dimsMap.get(n.id)!.height))
        const totalWidth = levelNodes.reduce(
          (sum, n, idx) => sum + dimsMap.get(n.id)!.width + (idx > 0 ? nodesep : 0),
          0
        )
        let cursorX = -totalWidth / 2 + 250
        for (const n of levelNodes) {
          const { width } = dimsMap.get(n.id)!
          positions.set(n.id, { x: cursorX, y: layerCursor })
          cursorX += width + nodesep
        }
        layerCursor += maxLevelHeight + ranksep
      }
    }

    const layoutedNodes = nodes.map((node) => {
      const pos = positions.get(node.id) ?? { x: 0, y: 0 }
      const dims = dimsMap.get(node.id)!
      return applyNodeLayout(node, pos.x, pos.y, dims, isHorizontal)
    })

    return { nodes: layoutedNodes, edges: formatLayoutEdges(edges) }
  }
}

export class LayoutManager {
  private engines: Record<LayoutType, LayoutEngine> = {
    dagre: new DagreLayoutEngine(),
    elk: new ElkLayoutEngine(),
    python: new PythonLayoutEngine(),
  }

  async layout(
    type: LayoutType,
    nodes: Node[],
    edges: Edge[],
    options: LayoutOptions
  ): Promise<LayoutResult> {
    const engine = this.engines[type] || this.engines.dagre
    return engine.layout(nodes, edges, options)
  }
}

export const layoutManager = new LayoutManager()
