import { useMemo, useEffect } from 'react'
import { useNodesState, useEdgesState, Position, MarkerType } from '@xyflow/react'
import type { Node, Edge } from '@xyflow/react'
import { findCycles } from '../utils/projectUtils'
import { getLayoutedElements } from '../utils/layoutUtils'
import type { FlowchartView } from '../constants/views'

interface UseDependencyGraphProps {
  scanData: any
  showExternal: boolean
  filterQuery: string
  showOnlyCycles: boolean
  selectedExtensions: string[]
  hoveredNodeId: string | null
  currentView: FlowchartView
  direction?: 'LR' | 'TB'
  nodesep?: number
  ranksep?: number
  activeFile?: string | null
}

const WEB_EXTENSIONS = ['.html', '.css', '.js', '.ts', '.jsx', '.tsx', '.vue', '.svelte', '.json']

export const useDependencyGraph = ({
  scanData,
  showExternal,
  filterQuery,
  showOnlyCycles,
  selectedExtensions,
  hoveredNodeId,
  currentView,
  direction = 'LR',
  nodesep = 70,
  ranksep = 160,
  activeFile
}: UseDependencyGraphProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  const graphStats = useMemo(() => {
    if (!scanData?.dependencies) {
      return {
        nodeInDegrees: {} as Record<string, number>,
        cycles: { cycleNodes: new Set<string>(), cycleEdges: new Set<string>() }
      }
    }

    const degrees: Record<string, number> = {}
    if (scanData.dependencies.links) {
      for (const link of scanData.dependencies.links) {
        const target = link.target
        degrees[target] = (degrees[target] || 0) + 1
      }
    }

    const cycles = findCycles(scanData.dependencies.nodes, scanData.dependencies.links)
    return { nodeInDegrees: degrees, cycles }
  }, [scanData])

  // Compute base layout only when graph structure, filters, or layout settings change (NOT on hover)
  const baseLayout = useMemo(() => {
    if (!scanData?.dependencies) {
      return {
        nodes: [] as Node[],
        edges: [] as Edge[],
        filteredLinks: [] as any[],
        totalVisibleNodesCount: 0
      }
    }

    const { nodeInDegrees, cycles } = graphStats
    const { nodes: rawNodes = [], links: rawLinks = [] } = scanData.dependencies

    const filteredNodes = rawNodes.filter((n: any) => {
      if (!showExternal && n.type === 'package') return false
      if (filterQuery && !n.id.toLowerCase().includes(filterQuery.toLowerCase())) return false
      if (showOnlyCycles && !cycles.cycleNodes.has(n.id)) return false
      if (selectedExtensions.length > 0 && n.type === 'file') {
        const ext = n.id.substring(n.id.lastIndexOf('.')).toLowerCase()
        if (!selectedExtensions.includes(ext)) return false
      }
      if (currentView === 'web' && n.type === 'file') {
        const ext = n.id.substring(n.id.lastIndexOf('.')).toLowerCase()
        if (!WEB_EXTENSIONS.includes(ext) && !n.id.startsWith('src/') && !n.id.startsWith('public/')) {
          return false
        }
      }
      return true
    })

    const count = filteredNodes.length
    const filteredNodeIds = new Set(filteredNodes.map((n: any) => n.id))
    const filteredLinks = rawLinks.filter((l: any) => {
      if (!showExternal && l.type === 'external') return false
      if (!filteredNodeIds.has(l.source) || !filteredNodeIds.has(l.target)) return false
      return true
    })

    const sortedNodes = [...filteredNodes].sort((a: any, b: any) => a.id.localeCompare(b.id))
    const highPerformanceMode = count > 80

    const calculatedNodes: Node[] = sortedNodes.map((n: any) => {
      const normalized = String(n.id).replace(/\\/g, '/')
      const lastSlash = normalized.lastIndexOf('/')
      const fileName = lastSlash >= 0 ? normalized.slice(lastSlash + 1) : normalized
      const folderPath = lastSlash >= 0 ? normalized.slice(0, lastSlash) : ''
      const inDegree = nodeInDegrees[n.id] || 0
      const isBottleneck = inDegree >= 3 && n.type === 'file'
      const isPartOfCycle = cycles.cycleNodes.has(n.id)

      return {
        id: n.id,
        type: 'custom',
        position: { x: 0, y: 0 },
        data: {
          label: n.id,
          fullPath: n.id,
          fileName,
          folderPath,
          inDegree,
          isBottleneck,
          isPackage: n.type === 'package',
          isPartOfCycle,
          isDimmed: false,
          highPerformanceMode
        },
        sourcePosition: direction === 'LR' ? Position.Right : Position.Bottom,
        targetPosition: direction === 'LR' ? Position.Left : Position.Top
      }
    })

    const calculatedEdges: Edge[] = calculatedNodes.length > 0
      ? filteredLinks.map((l: any, idx: number) => {
          const isExternal = l.type === 'external'
          const isPartOfCycle = cycles.cycleEdges.has(`${l.source}->${l.target}`)
          const strokeColor = isPartOfCycle
            ? 'var(--cycle)'
            : (isExternal ? 'var(--package)' : 'var(--accent)')

          const edgeClass = isPartOfCycle
            ? 'edge-cycle'
            : (isExternal ? 'edge-package' : 'edge-normal')

          return {
            id: `e-${idx}`,
            source: l.source,
            target: l.target,
            type: 'smoothstep',
            pathOptions: { borderRadius: 12 },
            className: highPerformanceMode ? 'edge-fast' : edgeClass,
            data: { isExternal, isPartOfCycle },
            style: {
              stroke: strokeColor,
              strokeWidth: isPartOfCycle ? 2 : 1.5,
              opacity: isPartOfCycle ? 0.75 : 0.38
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: strokeColor,
              width: isPartOfCycle ? 16 : 14,
              height: isPartOfCycle ? 16 : 14
            }
          }
        })
      : []

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      calculatedNodes,
      calculatedEdges,
      direction,
      nodesep,
      ranksep
    )

    return {
      nodes: layoutedNodes,
      edges: layoutedEdges,
      filteredLinks,
      totalVisibleNodesCount: count
    }
  }, [
    scanData,
    graphStats,
    showExternal,
    filterQuery,
    showOnlyCycles,
    selectedExtensions,
    currentView,
    direction,
    nodesep,
    ranksep
  ])

  // Sync base layout & apply hover/selection highlighting without re-running layout
  useEffect(() => {
    const focusNodeId = hoveredNodeId || activeFile || null
    const connectedNodeIds = new Set<string>()

    if (focusNodeId) {
      connectedNodeIds.add(focusNodeId)
      for (const link of baseLayout.filteredLinks) {
        if (link.source === focusNodeId) connectedNodeIds.add(link.target)
        if (link.target === focusNodeId) connectedNodeIds.add(link.source)
      }
    }

    setNodes(
      baseLayout.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isDimmed: focusNodeId !== null && !connectedNodeIds.has(node.id)
        }
      }))
    )

    setEdges(
      baseLayout.edges.map((edge) => {
        const isHighlighted = focusNodeId !== null && (edge.source === focusNodeId || edge.target === focusNodeId)
        const isExternal = Boolean((edge.data as any)?.isExternal)
        const isPartOfCycle = Boolean((edge.data as any)?.isPartOfCycle)
        const strokeColor = isPartOfCycle
          ? 'var(--cycle)'
          : (isExternal ? 'var(--package)' : 'var(--accent)')

        const opacity = focusNodeId === null
          ? (isPartOfCycle ? 0.75 : 0.38)
          : (isHighlighted ? 1 : 0.08)

        return {
          ...edge,
          className: isHighlighted ? 'edge-highlighted' : edge.className,
          zIndex: isHighlighted ? 10 : 0,
          style: {
            ...edge.style,
            stroke: strokeColor,
            strokeWidth: isHighlighted ? 2.5 : (isPartOfCycle ? 2 : 1.5),
            opacity
          }
        }
      })
    )
  }, [baseLayout, hoveredNodeId, activeFile, setNodes, setEdges])

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    totalVisibleNodesCount: baseLayout.totalVisibleNodesCount,
    cycles: graphStats.cycles,
    nodeInDegrees: graphStats.nodeInDegrees
  }
}
