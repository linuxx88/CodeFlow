import type {
  CycleLinkInput,
  CycleNodeInput,
  CycleResult,
  FileStructureNode,
  FlatFileItem,
  ScanData,
} from '../types'

export type { CycleResult, FileStructureNode, FlatFileItem }

const WEB_EXTENSIONS = new Set([
  '.html',
  '.css',
  '.js',
  '.ts',
  '.jsx',
  '.tsx',
  '.vue',
  '.svelte',
  '.json',
])

const formatFileSize = (size?: number): string => {
  if (size === undefined || size < 0) return ''
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export const fuzzyMatch = (text: string, query: string): boolean => {
  if (!query) return true
  if (!text) return false
  const cleanText = text.toLowerCase()
  const cleanQuery = query.toLowerCase()
  let queryIdx = 0
  for (let i = 0; i < cleanText.length; i++) {
    if (cleanText[i] === cleanQuery[queryIdx]) {
      queryIdx++
      if (queryIdx === cleanQuery.length) return true
    }
  }
  return false
}

const flattenTreeInternal = (
  node: FileStructureNode | null | undefined,
  collapsedDirs: Record<string, boolean> | null,
  depth = 0
): FlatFileItem[] => {
  if (!node) return []
  const isDir = node.type === 'directory'
  const path = node.relative_path || ''
  const isCollapsed = collapsedDirs ? Boolean(collapsedDirs[path]) : false

  const item: FlatFileItem = {
    name: node.name,
    isDir,
    sizeStr: isDir ? '' : formatFileSize(node.size),
    depth,
    path,
    isCollapsed,
  }

  const result: FlatFileItem[] = [item]
  if (!(isDir && isCollapsed) && node.children) {
    for (const child of node.children) {
      result.push(...flattenTreeInternal(child, collapsedDirs, depth + 1))
    }
  }
  return result
}

export const flattenFullTree = (
  node: FileStructureNode | null | undefined,
  depth = 0
): FlatFileItem[] => flattenTreeInternal(node, null, depth)

export const flattenTree = (
  node: FileStructureNode | null | undefined,
  collapsedDirs: Record<string, boolean>,
  depth = 0
): FlatFileItem[] => flattenTreeInternal(node, collapsedDirs, depth)

export const checkIsWebProject = (scanData: ScanData | null | undefined): boolean => {
  const nodes = scanData?.dependencies?.nodes
  if (!Array.isArray(nodes)) return false

  return nodes.some((n) => {
    if (n?.type !== 'file' || typeof n.id !== 'string') return false
    const lastDot = n.id.lastIndexOf('.')
    if (lastDot === -1) return false
    const ext = n.id.substring(lastDot).toLowerCase()
    return WEB_EXTENSIONS.has(ext)
  })
}

export const findCycles = (
  nodes: CycleNodeInput[],
  links: CycleLinkInput[]
): CycleResult => {
  const safeNodes = Array.isArray(nodes) ? nodes : []
  const safeLinks = Array.isArray(links) ? links : []

  const adj = new Map<string, string[]>()
  for (const n of safeNodes) {
    if (n?.id && !adj.has(n.id)) {
      adj.set(n.id, [])
    }
  }
  for (const l of safeLinks) {
    if (!l) continue
    const neighbors = adj.get(l.source)
    if (neighbors && adj.has(l.target) && !neighbors.includes(l.target)) {
      neighbors.push(l.target)
    }
  }

  const index = new Map<string, number>()
  const lowlink = new Map<string, number>()
  const onStack = new Set<string>()
  const stack: string[] = []
  let currentIndex = 0
  const sccs: string[][] = []

  const strongConnect = (v: string) => {
    index.set(v, currentIndex)
    lowlink.set(v, currentIndex)
    currentIndex++
    stack.push(v)
    onStack.add(v)

    const neighbors = adj.get(v) ?? []
    for (const w of neighbors) {
      if (!index.has(w)) {
        strongConnect(w)
        lowlink.set(v, Math.min(lowlink.get(v)!, lowlink.get(w)!))
      } else if (onStack.has(w)) {
        lowlink.set(v, Math.min(lowlink.get(v)!, index.get(w)!))
      }
    }

    if (lowlink.get(v) === index.get(v)) {
      const scc: string[] = []
      let w: string
      do {
        w = stack.pop()!
        onStack.delete(w)
        scc.push(w)
      } while (w !== v)
      sccs.push(scc)
    }
  }

  for (const nodeId of adj.keys()) {
    if (!index.has(nodeId)) {
      strongConnect(nodeId)
    }
  }

  const cycleNodes = new Set<string>()
  const sccMap = new Map<string, number>()
  const cyclicSccs: string[][] = []

  sccs.forEach((scc, sccIdx) => {
    if (scc.length > 1) {
      cyclicSccs.push(scc)
      for (const nodeId of scc) {
        cycleNodes.add(nodeId)
        sccMap.set(nodeId, sccIdx)
      }
    } else if (scc.length === 1) {
      const nodeId = scc[0]
      if (adj.get(nodeId)?.includes(nodeId)) {
        cyclicSccs.push(scc)
        cycleNodes.add(nodeId)
        sccMap.set(nodeId, sccIdx)
      }
    }
  })

  const cycleEdges = new Set<string>()
  for (const l of safeLinks) {
    if (!l) continue
    const u = l.source
    const v = l.target
    if (
      cycleNodes.has(u) &&
      cycleNodes.has(v) &&
      (sccMap.get(u) === sccMap.get(v) || u === v)
    ) {
      cycleEdges.add(`${u}->${v}`)
    }
  }

  return { cycleNodes, cycleEdges, sccs: cyclicSccs }
}
