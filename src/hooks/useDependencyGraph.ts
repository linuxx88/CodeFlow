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
}

export const useDependencyGraph = ({
  scanData,
  showExternal,
  filterQuery,
  showOnlyCycles,
  selectedExtensions,
  hoveredNodeId,
  currentView
}: UseDependencyGraphProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  const nodeInDegrees = useMemo(() => {
    const degrees: Record<string, number> = {}
    if (!scanData?.dependencies?.links) return degrees
    for (const link of scanData.dependencies.links) {
      const target = link.target
      degrees[target] = (degrees[target] || 0) + 1
    }
    return degrees
  }, [scanData])

  const cycles = useMemo(() => {
    if (!scanData?.dependencies?.nodes) {
      return { cycleNodes: new Set<string>(), cycleEdges: new Set<string>() }
    }
    return findCycles(scanData.dependencies.nodes, scanData.dependencies.links)
  }, [scanData])

  const totalVisibleNodesCount = useMemo(() => {
    if (!scanData?.dependencies?.nodes) return 0
    return scanData.dependencies.nodes.filter((n: any) => {
      if (!showExternal && n.type === 'package') return false
      if (filterQuery && !n.id.toLowerCase().includes(filterQuery.toLowerCase())) return false
      if (showOnlyCycles && !cycles.cycleNodes.has(n.id)) return false
      if (selectedExtensions.length > 0 && n.type === 'file') {
        const ext = n.id.substring(n.id.lastIndexOf('.')).toLowerCase()
        if (!selectedExtensions.includes(ext)) return false
      }
      if (currentView === 'web' && n.type === 'file') {
        const ext = n.id.substring(n.id.lastIndexOf('.')).toLowerCase()
        const webExtensions = ['.html', '.css', '.js', '.ts', '.jsx', '.tsx', '.vue', '.svelte', '.json']
        if (!webExtensions.includes(ext) && !n.id.startsWith('src/') && !n.id.startsWith('public/')) {
          return false
        }
      }
      return true
    }).length
  }, [scanData, showExternal, filterQuery, currentView, showOnlyCycles, cycles, selectedExtensions])

  useEffect(() => {
    if (!scanData?.dependencies) return

    const { nodes: rawNodes, links: rawLinks } = scanData.dependencies
    
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
        const webExtensions = ['.html', '.css', '.js', '.ts', '.jsx', '.tsx', '.vue', '.svelte', '.json']
        if (!webExtensions.includes(ext) && !n.id.startsWith('src/') && !n.id.startsWith('public/')) {
          return false
        }
      }
      return true
    })

    const filteredNodeIds = new Set(filteredNodes.map((n: any) => n.id))

    const filteredLinks = rawLinks.filter((l: any) => {
      if (!showExternal && l.type === 'external') return false
      if (!filteredNodeIds.has(l.source) || !filteredNodeIds.has(l.target)) return false
      return true
    })

    const connectedNodeIds = new Set<string>()
    if (hoveredNodeId) {
      connectedNodeIds.add(hoveredNodeId)
      for (const link of filteredLinks) {
        if (link.source === hoveredNodeId) {
          connectedNodeIds.add(link.target)
        }
        if (link.target === hoveredNodeId) {
          connectedNodeIds.add(link.source)
        }
      }
    }

    const dirsList = filteredNodes.filter((n: any) => n.type === 'file' && n.id.includes('/'))
    const rootFiles = filteredNodes.filter((n: any) => n.type === 'file' && !n.id.includes('/'))
    const pkgsList = filteredNodes.filter((n: any) => n.type === 'package')

    dirsList.sort((a: any, b: any) => a.id.localeCompare(b.id))
    rootFiles.sort((a: any, b: any) => a.id.localeCompare(b.id))

    const finalNodesList = [...dirsList, ...rootFiles, ...pkgsList]

    const calculatedNodes: Node[] = finalNodesList.map((n: any, idx: number) => {
      let x = 400
      if (n.type === 'package') {
        x = 800
      } else if (n.id.includes('/')) {
        x = 100
      }
      
      const inDegree = nodeInDegrees[n.id] || 0
      const isBottleneck = inDegree >= 3 && n.type === 'file'
      const isPartOfCycle = cycles.cycleNodes.has(n.id)
      const label = n.id
      const isDimmed = hoveredNodeId !== null && !connectedNodeIds.has(n.id)

      return {
        id: n.id,
        type: 'custom',
        position: { x, y: idx * 80 + 50 },
        data: {
          label: `${label} (${inDegree} in)`,
          isBottleneck,
          isPackage: n.type === 'package',
          isPartOfCycle,
          isDimmed
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left
      }
    })

    const calculatedEdges: Edge[] = calculatedNodes.length > 0 ? filteredLinks.map((l: any, idx: number) => {
      const isExternal = l.type === 'external'
      const isHighlighted = hoveredNodeId !== null && (l.source === hoveredNodeId || l.target === hoveredNodeId)
      const isDimmed = hoveredNodeId !== null && !isHighlighted
      const isPartOfCycle = cycles.cycleEdges.has(`${l.source}->${l.target}`)
      
      let strokeColor = isExternal ? 'var(--package)' : 'var(--accent)'
      if (isPartOfCycle) {
        strokeColor = 'var(--cycle)'
      }
      if (hoveredNodeId !== null) {
        strokeColor = isHighlighted ? (isPartOfCycle ? 'var(--cycle)' : (isExternal ? 'var(--package)' : 'var(--accent)')) : 'rgba(255, 255, 255, 0.04)'
      }

      return {
        id: `e-${idx}`,
        source: l.source,
        target: l.target,
        type: 'smoothstep',
        animated: isPartOfCycle || (!isExternal && (hoveredNodeId === null || isHighlighted)),
        style: {
          stroke: strokeColor,
          strokeWidth: isPartOfCycle ? 2 : (isHighlighted ? 2.5 : (isExternal ? 1 : 1.5)),
          strokeDasharray: isExternal ? '4 4' : undefined,
          opacity: isDimmed ? 0.15 : 1
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
          width: isHighlighted || isPartOfCycle ? 18 : 15,
          height: isHighlighted || isPartOfCycle ? 18 : 15
        }
      }
    }) : []

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(calculatedNodes, calculatedEdges, 'LR')
    setNodes(layoutedNodes)
    setEdges(layoutedEdges)
  }, [scanData, showExternal, filterQuery, nodeInDegrees, hoveredNodeId, currentView, showOnlyCycles, cycles, selectedExtensions, setNodes, setEdges])

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    totalVisibleNodesCount,
    cycles,
    nodeInDegrees
  }
}
