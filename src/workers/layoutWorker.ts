import { findCycles } from '../utils/projectUtils'
import dagre from '@dagrejs/dagre'

const getLayoutedElements = (
  nodes: any[],
  edges: any[],
  direction = 'LR',
  nodesep = 80,
  ranksep = 120
) => {
  if (nodes.length === 0) return { nodes, edges }

  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  
  const isHorizontal = direction === 'LR'
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep,
    ranksep,
  })

  nodes.forEach((node) => {
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
    dagreGraph.setNode(node.id, { width, height })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id) || { x: 0, y: 0 }
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
    
    return {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      data: {
        ...node.data,
        width,
        height
      },
      position: {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2 + 80,
      },
    }
  })

  const layoutedEdges = edges.map((edge) => {
    return {
      ...edge,
      type: edge.type || 'smoothstep',
      markerEnd: edge.markerEnd || { type: 'arrowclosed' }
    }
  })

  return { nodes: layoutedNodes, edges: layoutedEdges }
}

self.onmessage = (event: MessageEvent) => {
  const {
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
  } = event.data

  if (!scanData?.dependencies) {
    self.postMessage({
      nodes: [],
      edges: [],
      totalVisibleNodesCount: 0,
      cycles: { cycleNodes: [], cycleEdges: [] },
      nodeInDegrees: {}
    })
    return
  }

  // 1. nodeInDegrees
  const nodeInDegrees: Record<string, number> = {}
  if (scanData.dependencies.links) {
    for (const link of scanData.dependencies.links) {
      const target = link.target
      nodeInDegrees[target] = (nodeInDegrees[target] || 0) + 1
    }
  }

  // 2. findCycles
  const cycles = findCycles(scanData.dependencies.nodes, scanData.dependencies.links)
  const cyclesArray = {
    cycleNodes: Array.from(cycles.cycleNodes),
    cycleEdges: Array.from(cycles.cycleEdges)
  }
  const cycleNodesSet = cycles.cycleNodes

  // 3. visible count & filtering
  const { nodes: rawNodes, links: rawLinks } = scanData.dependencies
  
  const filteredNodes = rawNodes.filter((n: any) => {
    if (!showExternal && n.type === 'package') return false
    if (filterQuery && !n.id.toLowerCase().includes(filterQuery.toLowerCase())) return false
    if (showOnlyCycles && !cycleNodesSet.has(n.id)) return false
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

  const totalVisibleNodesCount = filteredNodes.length
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
  const highPerformanceMode = totalVisibleNodesCount > 80

  const calculatedNodes = finalNodesList.map((n: any, idx: number) => {
    let x = 400
    if (n.type === 'package') {
      x = 800
    } else if (n.id.includes('/')) {
      x = 100
    }
    
    const inDegree = nodeInDegrees[n.id] || 0
    const isBottleneck = inDegree >= 3 && n.type === 'file'
    const isPartOfCycle = cycleNodesSet.has(n.id)
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
      sourcePosition: 'right',
      targetPosition: 'left'
    }
  })

  const calculatedEdges = calculatedNodes.length > 0 ? filteredLinks.map((l: any, idx: number) => {
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
        type: 'arrowclosed',
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

  self.postMessage({
    nodes: layoutedNodes,
    edges: layoutedEdges,
    totalVisibleNodesCount,
    cycles: cyclesArray,
    nodeInDegrees
  })
}
