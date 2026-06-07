import dagre from '@dagrejs/dagre'
import { Position } from '@xyflow/react'
import type { Node, Edge } from '@xyflow/react'

export interface LayoutOptions {
  direction: 'LR' | 'TB'
  nodesep: number
  ranksep: number
}

export interface LayoutEngine {
  layout(nodes: Node[], edges: Edge[], options: LayoutOptions): Promise<{ nodes: Node[]; edges: Edge[] }> | { nodes: Node[]; edges: Edge[] }
}

export const getNodeDimensions = (node: Node) => {
  const label = String(node.data?.label || node.data?.name || '')
  const isClassNode = node.type === 'classNode'
  const isCondition = node.data?.type === 'condition'
  
  let width = Math.max(180, label.length * 8 + 40)
  let height = 44
  
  if (isClassNode) {
    width = 240
    const propertiesCount = Array.isArray(node.data?.properties) ? node.data.properties.length : 0
    const methodsCount = Array.isArray(node.data?.methods) ? node.data.methods.length : 0
    height = 60 + Math.max(1, propertiesCount) * 16 + Math.max(1, methodsCount) * 16 + 20
  } else if (isCondition) {
    width = Math.max(180, label.length * 6 + 60)
    height = Math.max(90, Math.min(130, width * 0.55))
  }
  return { width, height }
}

export class DagreLayoutEngine implements LayoutEngine {
  layout(nodes: Node[], edges: Edge[], options: LayoutOptions) {
    if (nodes.length === 0) return { nodes, edges }

    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))

    const isHorizontal = options.direction === 'LR'
    dagreGraph.setGraph({
      rankdir: options.direction,
      nodesep: options.nodesep,
      ranksep: options.ranksep,
    })

    nodes.forEach((node) => {
      const { width, height } = getNodeDimensions(node)
      dagreGraph.setNode(node.id, { width, height })
    })

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target)
    })

    dagre.layout(dagreGraph)

    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id) || { x: 0, y: 0 }
      const { width, height } = getNodeDimensions(node)

      return {
        ...node,
        targetPosition: isHorizontal ? Position.Left : Position.Top,
        sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
        data: {
          ...node.data,
          width,
          height,
        },
        position: {
          x: nodeWithPosition.x - width / 2,
          y: nodeWithPosition.y - height / 2 + 80,
        },
      }
    })

    const layoutedEdges = edges.map((edge) => ({
      ...edge,
      type: edge.type || 'smoothstep',
      markerEnd: edge.markerEnd || { type: 'arrowclosed' as any }
    }))

    return { nodes: layoutedNodes, edges: layoutedEdges }
  }
}

export class ElkLayoutEngine implements LayoutEngine {
  private elkInstance: any = null

  async layout(nodes: Node[], edges: Edge[], options: LayoutOptions) {
    if (nodes.length === 0) return { nodes, edges }

    const isHorizontal = options.direction === 'LR'
    
    if (!this.elkInstance) {
      const ELKModule = await import('elkjs/lib/elk.bundled.js')
      // Handle ES6 / CommonJS default export variation
      const ELK = ELKModule.default || ELKModule
      this.elkInstance = new ELK()
    }
    
    const elkNodes = nodes.map((node) => {
      const { width, height } = getNodeDimensions(node)
      return {
        id: node.id,
        width,
        height,
      }
    })

    const elkEdges = edges.map((edge) => ({
      id: edge.id || `e_${edge.source}_${edge.target}`,
      sources: [edge.source],
      targets: [edge.target],
    }))

    const graph = {
      id: 'root',
      layoutOptions: {
        'elk.algorithm': 'layered',
        'elk.direction': isHorizontal ? 'RIGHT' : 'DOWN',
        'elk.spacing.nodeNode': String(options.nodesep),
        'elk.layered.spacing.nodeNodeBetweenLayers': String(options.ranksep),
      },
      children: elkNodes,
      edges: elkEdges,
    }

    try {
      const layoutedGraph = await this.elkInstance.layout(graph)
      
      const layoutedNodes = nodes.map((node) => {
        const elkNode = layoutedGraph.children?.find((c: any) => c.id === node.id)
        const { width, height } = getNodeDimensions(node)
        const x = elkNode?.x ?? 0
        const y = elkNode?.y ?? 0

        return {
          ...node,
          targetPosition: isHorizontal ? Position.Left : Position.Top,
          sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
          data: {
            ...node.data,
            width,
            height,
          },
          position: {
            x,
            y: y + 80,
          },
        }
      })

      const layoutedEdges = edges.map((edge) => ({
        ...edge,
        type: edge.type || 'smoothstep',
        markerEnd: edge.markerEnd || { type: 'arrowclosed' as any }
      }))

      return { nodes: layoutedNodes, edges: layoutedEdges }
    } catch (error) {
      console.error('ELK layout failed, falling back to Dagre', error)
      return new DagreLayoutEngine().layout(nodes, edges, options)
    }
  }
}

export class PythonLayoutEngine implements LayoutEngine {
  layout(nodes: Node[], edges: Edge[], options: LayoutOptions) {
    if (nodes.length === 0) return { nodes, edges }

    const isHorizontal = options.direction === 'LR'
    const levels: Record<string, number> = {}
    nodes.forEach(n => { levels[n.id] = 0 })

    const adj: Record<string, string[]> = {}
    const inDegree: Record<string, number> = {}
    nodes.forEach(n => {
      adj[n.id] = []
      inDegree[n.id] = 0
    })

    edges.forEach(e => {
      if (adj[e.source] && adj[e.target] !== undefined) {
        adj[e.source].push(e.target)
        inDegree[e.target]++
      }
    })

    const queue: string[] = nodes.filter(n => inDegree[n.id] === 0).map(n => n.id)
    if (queue.length === 0 && nodes.length > 0) {
      queue.push(nodes[0].id)
    }

    const visited = new Set<string>()
    while (queue.length > 0) {
      const curr = queue.shift()!
      if (visited.has(curr)) continue
      visited.add(curr)

      const currLevel = levels[curr]
      adj[curr].forEach(next => {
        levels[next] = Math.max(levels[next], currLevel + 1)
        queue.push(next)
      })
    }

    const nodesByLevel: Record<number, Node[]> = {}
    nodes.forEach(node => {
      const lvl = levels[node.id] || 0
      if (!nodesByLevel[lvl]) nodesByLevel[lvl] = []
      nodesByLevel[lvl].push(node)
    })

    const layoutedNodes = nodes.map(node => {
      const { width, height } = getNodeDimensions(node)
      const lvl = levels[node.id] || 0
      const levelNodes = nodesByLevel[lvl]
      const indexInLevel = levelNodes.findIndex(n => n.id === node.id)
      const levelCount = levelNodes.length

      let x = 0
      let y = 0

      if (isHorizontal) {
        x = lvl * options.ranksep * 1.5
        const totalHeight = levelCount * (options.nodesep + 44)
        y = indexInLevel * (options.nodesep + 44) - totalHeight / 2 + 200
      } else {
        y = lvl * options.ranksep * 1.5
        const totalWidth = levelCount * (options.nodesep + width)
        x = indexInLevel * (options.nodesep + width) - totalWidth / 2 + 250
      }

      return {
        ...node,
        targetPosition: isHorizontal ? Position.Left : Position.Top,
        sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
        data: {
          ...node.data,
          width,
          height,
        },
        position: {
          x,
          y: y + 80,
        },
      }
    })

    const layoutedEdges = edges.map((edge) => ({
      ...edge,
      type: edge.type || 'smoothstep',
      markerEnd: edge.markerEnd || { type: 'arrowclosed' as any }
    }))

    return { nodes: layoutedNodes, edges: layoutedEdges }
  }
}

export type LayoutType = 'dagre' | 'elk' | 'python'

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
  ): Promise<{ nodes: Node[]; edges: Edge[] }> {
    const engine = this.engines[type] || this.engines.dagre
    return engine.layout(nodes, edges, options)
  }
}

export const layoutManager = new LayoutManager()
