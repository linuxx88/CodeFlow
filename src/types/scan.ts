/**
 * Shared TypeScript types for project scanning results, file trees,
 * dependency graphs, and cycle detection.
 */

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

export interface DependencyNode {
  id: string
  type: 'file' | 'package' | string
  label?: string
  [key: string]: unknown
}

export interface DependencyLink {
  source: string
  target: string
  [key: string]: unknown
}

export interface DependencyGraph {
  nodes: DependencyNode[]
  links: DependencyLink[]
}

export interface GitHotspot {
  file: string
  commits: number
}

export interface GitScanData {
  hotspots?: GitHotspot[]
  is_git_repo?: boolean
  [key: string]: unknown
}

export interface ConditionalItem {
  type: 'ifelse' | 'switch' | string
  line?: number
  condition?: string
  expression?: string
  then?: string
  else?: string | null
  cases?: string[]
}

export interface ConditionalFile {
  file: string
  items: ConditionalItem[]
}

export interface ClassItem {
  name: string
  inherits?: string | string[] | null
  properties?: string[]
  methods?: string[]
  line?: number
}

export interface ClassFile {
  file: string
  items: ClassItem[]
}

export interface LoopItem {
  line?: number
  condition?: string
  body?: string
}

export interface LoopFile {
  file: string
  items: LoopItem[]
}

export interface AlgoItem {
  name: string
  args?: string
  steps?: string[]
  line?: number
}

export interface AlgoFile {
  file: string
  items: AlgoItem[]
}

export interface PythonItem {
  type: 'tryexcept' | 'decorator' | 'main' | string
  try?: string
  except?: string
  name?: string
  line?: number
}

export interface PythonFile {
  file: string
  items: PythonItem[]
}

export interface ScanData {
  structure?: FileStructureNode | null
  dependencies?: DependencyGraph
  git?: GitScanData
  conditionals?: ConditionalFile[]
  classes?: ClassFile[]
  loops?: LoopFile[]
  repeatLoops?: LoopFile[]
  algorithms?: AlgoFile[]
  pythonStructures?: PythonFile[]
}

export interface CycleNodeInput {
  id: string
}

export interface CycleLinkInput {
  source: string
  target: string
}

export interface CycleResult {
  cycleNodes: Set<string>
  cycleEdges: Set<string>
  sccs: string[][]
}
