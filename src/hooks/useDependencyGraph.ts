import { useMemo, useEffect, useState, useRef } from 'react'
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

export const useDependencyGraph = ({
  scanData,
  showExternal,
  filterQuery,
  showOnlyCycles,
  selectedExtensions,
  hoveredNodeId,
  currentView,
  direction = 'LR',
  nodesep = 40,
  ranksep = 80,
  activeFile
}: UseDependencyGraphProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [totalVisibleNodesCount, setTotalVisibleNodesCount] = useState(0)
  const [cyclesData, setCyclesData] = useState<{ cycleNodes: string[]; cycleEdges: string[] }>({
    cycleNodes: [],
    cycleEdges: []
  })
  const [nodeInDegrees, setNodeInDegrees] = useState<Record<string, number>>({})

  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.Worker !== 'undefined') {
      const worker = new Worker(
        new URL('../workers/layoutWorker.ts', import.meta.url),
        { type: 'module' }
      )
      workerRef.current = worker

      worker.onmessage = (event) => {
        const {
          nodes: layoutedNodes,
          edges: layoutedEdges,
          totalVisibleNodesCount: count,
          cycles,
          nodeInDegrees: degrees
        } = event.data

        setNodes(layoutedNodes)
        setEdges(layoutedEdges)
        setTotalVisibleNodesCount(count)
        setCyclesData(cycles)
        setNodeInDegrees(degrees)
      }

      return () => {
        worker.terminate()
        workerRef.current = null
      }
    }
  }, [setNodes, setEdges])

  useEffect(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        scanData,
        showExternal,
        filterQuery,
        showOnlyCycles,
        selectedExtensions,
        hoveredNodeId,
        currentView,
        direction,
        nodesep,
        ranksep,
        activeFile
      })
    } else {
      setTimeout(() => {
        if (!scanData?.dependencies) {
          setNodes([])
          setEdges([])
          setTotalVisibleNodesCount(0)
          setCyclesData({ cycleNodes: [], cycleEdges: [] })
          setNodeInDegrees({})
          return
        }

        const degrees: Record<string, number> = {}
        if (scanData.dependencies.links) {
          for (const link of scanData.dependencies.links) {
            const target = link.target
            degrees[target] = (degrees[target] || 0) + 1
          }
        }
        setNodeInDegrees(degrees)

        const cycles = findCycles(scanData.dependencies.nodes, scanData.dependencies.links)
        setCyclesData({
          cycleNodes: Array.from(cycles.cycleNodes),
          cycleEdges: Array.from(cycles.cycleEdges)
        })

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

        const count = filteredNodes.length
        setTotalVisibleNodesCount(count)

        const filteredNodeIds = new Set(filteredNodes.map((n: any) => n.id))
        const filteredLinks = rawLinks.filter((l: any) => {
          if (!showExternal && l.type === 'external') return false
          if (!filteredNodeIds.has(l.source) || !filteredNodeIds.has(l.target)) return false
          return true
        })

        const connectedNodeIds = new Set<string>()
        const focusNodeId = hoveredNodeId || activeFile

        if (focusNodeId) {
          connectedNodeIds.add(focusNodeId)
          for (const link of filteredLinks) {
            if (link.source === focusNodeId) {
              connectedNodeIds.add(link.target)
            }
            if (link.target === focusNodeId) {
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
        const highPerformanceMode = count > 80

        const calculatedNodes: Node[] = finalNodesList.map((n: any, idx: number) => {
          let x = 400
          if (n.type === 'package') {
            x = 800
          } else if (n.id.includes('/')) {
            x = 100
          }
          
          const inDegree = degrees[n.id] || 0
          const isBottleneck = inDegree >= 3 && n.type === 'file'
          const isPartOfCycle = cycles.cycleNodes.has(n.id)
          const label = n.id
          const isDimmed = focusNodeId !== null && !connectedNodeIds.has(n.id)

          return {
            id: n.id,
            type: 'custom',
            position: { x, y: idx * 80 + 50 },
            data: {
              label: `${label} (${inDegree} in)`,
              isBottleneck,
              isPackage: n.type === 'package',
              isPartOfCycle,
              isDimmed,
              highPerformanceMode
            },
            sourcePosition: Position.Right,
            targetPosition: Position.Left
          }
        })

        const calculatedEdges: Edge[] = calculatedNodes.length > 0 ? filteredLinks.map((l: any, idx: number) => {
          const isExternal = l.type === 'external'
          const isHighlighted = focusNodeId !== null && (l.source === focusNodeId || l.target === focusNodeId)
          const isDimmed = focusNodeId !== null && !isHighlighted
          const isPartOfCycle = cycles.cycleEdges.has(`${l.source}->${l.target}`)
          
          let strokeColor = isExternal ? 'var(--package)' : 'var(--accent)'
          if (isPartOfCycle) {
            strokeColor = 'var(--cycle)'
          }
          if (focusNodeId !== null) {
            strokeColor = isHighlighted ? (isPartOfCycle ? 'var(--cycle)' : (isExternal ? 'var(--package)' : 'var(--accent)')) : 'rgba(255, 255, 255, 0.04)'
          }

          let edgeClass = 'edge-normal'
          if (isPartOfCycle) {
            edgeClass = 'edge-cycle'
          } else if (isHighlighted) {
            edgeClass = 'edge-highlighted'
          } else if (isExternal) {
            edgeClass = 'edge-package'
          }

          return {
            id: `e-${idx}`,
            source: l.source,
            target: l.target,
            type: highPerformanceMode ? 'straight' : 'smoothstep',
            className: highPerformanceMode ? 'edge-fast' : edgeClass,
            style: {
              stroke: strokeColor,
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

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          calculatedNodes,
          calculatedEdges,
          direction,
          nodesep,
          ranksep
        )
        setNodes(layoutedNodes)
        setEdges(layoutedEdges)
      }, 0)
    }
  }, [
    scanData,
    showExternal,
    filterQuery,
    showOnlyCycles,
    selectedExtensions,
    hoveredNodeId,
    currentView,
    direction,
    nodesep,
    ranksep,
    activeFile,
    setNodes,
    setEdges
  ])

  const cyclesSet = useMemo(() => {
    return {
      cycleNodes: new Set(cyclesData.cycleNodes),
      cycleEdges: new Set(cyclesData.cycleEdges)
    }
  }, [cyclesData])

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    totalVisibleNodesCount,
    cycles: cyclesSet,
    nodeInDegrees
  }
}
