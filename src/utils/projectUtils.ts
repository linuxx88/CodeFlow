export interface FileStructureNode {
  name: string
  type: 'file' | 'directory'
  relative_path?: string
  size?: number
  children?: FileStructureNode[]
}

export interface FlatFileItem {
  name: string
  isDir: boolean
  sizeStr: string
  depth: number
  path: string
  isCollapsed: boolean
}

export const fuzzyMatch = (text: string, query: string): boolean => {
  if (!query) return true
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

export const flattenFullTree = (node: any, depth = 0): FlatFileItem[] => {
  if (!node) return []
  const isDir = node.type === 'directory'
  const path = node.relative_path || ''
  
  let sizeStr = ''
  if (!isDir && node.size !== undefined) {
    const size = node.size
    if (size < 1024) sizeStr = `${size} B`
    else if (size < 1024 * 1024) sizeStr = `${(size / 1024).toFixed(1)} KB`
    else sizeStr = `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  const item: FlatFileItem = {
    name: node.name,
    isDir,
    sizeStr,
    depth,
    path,
    isCollapsed: false
  }

  const result: FlatFileItem[] = [item]
  if (node.children) {
    for (const child of node.children) {
      result.push(...flattenFullTree(child, depth + 1))
    }
  }
  return result
}

export const flattenTree = (
  node: FileStructureNode | null,
  collapsedDirs: Record<string, boolean>,
  depth = 0
): FlatFileItem[] => {
  if (!node) return []
  const isDir = node.type === 'directory'
  const path = node.relative_path || ''
  const isCollapsed = collapsedDirs[path] || false
  
  let sizeStr = ''
  if (!isDir && node.size !== undefined) {
    const size = node.size
    if (size < 1024) sizeStr = `${size} B`
    else if (size < 1024 * 1024) sizeStr = `${(size / 1024).toFixed(1)} KB`
    else sizeStr = `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  const item: FlatFileItem = {
    name: node.name,
    isDir,
    sizeStr,
    depth,
    path,
    isCollapsed
  }

  const result: FlatFileItem[] = [item]
  if (!(isDir && isCollapsed) && node.children) {
    for (const child of node.children) {
      result.push(...flattenTree(child, collapsedDirs, depth + 1))
    }
  }
  return result
}

export const checkIsWebProject = (scanData: any): boolean => {
  if (!scanData?.dependencies?.nodes) return false
  const webExtensions = ['.html', '.css', '.js', '.ts', '.jsx', '.tsx', '.vue', '.svelte', '.json']
  return scanData.dependencies.nodes.some((n: any) => {
    if (n.type !== 'file') return false
    const ext = n.id.substring(n.id.lastIndexOf('.')).toLowerCase()
    return webExtensions.includes(ext)
  })
}

export interface CycleResult {
  cycleNodes: Set<string>
  cycleEdges: Set<string>
  sccs: string[][]
}

export const findCycles = (nodes: any[], links: any[]): CycleResult => {
  const adj: Record<string, string[]> = {}
  for (const n of nodes) {
    adj[n.id] = []
  }
  for (const l of links) {
    if (adj[l.source] && adj[l.target]) {
      adj[l.source].push(l.target)
    }
  }

  const index: Record<string, number> = {}
  const lowlink: Record<string, number> = {}
  const onStack: Record<string, boolean> = {}
  const stack: string[] = []
  let currentIndex = 0
  const sccs: string[][] = []

  const strongConnect = (v: string) => {
    index[v] = currentIndex
    lowlink[v] = currentIndex
    currentIndex++
    stack.push(v)
    onStack[v] = true

    const neighbors = adj[v] || []
    for (const w of neighbors) {
      if (index[w] === undefined) {
        strongConnect(w)
        lowlink[v] = Math.min(lowlink[v], lowlink[w])
      } else if (onStack[w]) {
        lowlink[v] = Math.min(lowlink[v], index[w])
      }
    }

    if (lowlink[v] === index[v]) {
      const scc: string[] = []
      let w: string
      do {
        w = stack.pop()!
        onStack[w] = false
        scc.push(w)
      } while (w !== v)
      sccs.push(scc)
    }
  }

  for (const n of nodes) {
    if (index[n.id] === undefined) {
      strongConnect(n.id)
    }
  }

  const cycleNodes = new Set<string>()
  const sccMap: Record<string, number> = {}
  const cyclicSccs: string[][] = []

  sccs.forEach((scc, sccIdx) => {
    if (scc.length > 1) {
      cyclicSccs.push(scc)
      scc.forEach(nodeId => {
        cycleNodes.add(nodeId)
        sccMap[nodeId] = sccIdx
      })
    } else if (scc.length === 1) {
      const nodeId = scc[0]
      if (adj[nodeId]?.includes(nodeId)) {
        cyclicSccs.push(scc)
        cycleNodes.add(nodeId)
        sccMap[nodeId] = sccIdx
      }
    }
  })

  const cycleEdges = new Set<string>()
  links.forEach((l) => {
    const u = l.source
    const v = l.target
    const edgeId = `${u}->${v}`
    if (cycleNodes.has(u) && cycleNodes.has(v) && (sccMap[u] === sccMap[v] || u === v)) {
      cycleEdges.add(edgeId)
    }
  })

  return { cycleNodes, cycleEdges, sccs: cyclicSccs }
}
