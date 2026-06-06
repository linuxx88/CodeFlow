import fs from 'fs/promises'
import path from 'path'

const EXCLUDED_DIRS = new Set([
  'node_modules', '.git', '__pycache__', '.venv', '.states', '.web', 'dist', 'build'
])

export interface ScanNode {
  name: string
  type: 'directory' | 'file' | 'unknown'
  relative_path: string
  size?: number
  children?: ScanNode[]
  error?: {
    message: string
    code: string
  }
}

export async function scanDir(dirPath: string, rootPath: string, signal?: AbortSignal): Promise<ScanNode | null> {
  if (signal?.aborted) {
    const err = new Error('The operation was aborted.')
    err.name = 'AbortError'
    throw err
  }
  const name = path.basename(dirPath) || dirPath
  const relativePath = path.relative(rootPath, dirPath)
  
  let stats: any
  try {
    stats = await fs.stat(dirPath)
  } catch (e: any) {
    if (e.name === 'AbortError') throw e
    return {
      name,
      type: 'unknown',
      relative_path: relativePath,
      error: {
        message: e.message || String(e),
        code: e.code || 'UNKNOWN'
      }
    }
  }
  
  if (stats.isDirectory()) {
    if (EXCLUDED_DIRS.has(name)) return null
    
    const children: ScanNode[] = []
    let error: any = undefined
    try {
      const files = await fs.readdir(dirPath)
      for (const file of files) {
        if (signal?.aborted) {
          const err = new Error('The operation was aborted.')
          err.name = 'AbortError'
          throw err
        }
        const child = await scanDir(path.join(dirPath, file), rootPath, signal)
        if (child) children.push(child)
      }
    } catch (e: any) {
      if (e.name === 'AbortError') throw e
      error = {
        message: e.message || String(e),
        code: e.code || 'UNKNOWN'
      }
    }
    
    children.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name)
      return a.type === 'directory' ? -1 : 1
    })
    
    const dirNode: ScanNode = {
      name,
      type: 'directory',
      relative_path: relativePath,
      children
    }
    if (error) {
      dirNode.error = error
    }
    return dirNode
  } else {
    return {
      name,
      type: 'file',
      size: stats.size,
      relative_path: relativePath
    }
  }
}

export async function getAllFiles(dirPath: string, rootPath: string, fileList: string[] = [], signal?: AbortSignal): Promise<string[]> {
  if (signal?.aborted) {
    const err = new Error('The operation was aborted.')
    err.name = 'AbortError'
    throw err
  }
  try {
    const files = await fs.readdir(dirPath)
    for (const file of files) {
      if (signal?.aborted) {
        const err = new Error('The operation was aborted.')
        err.name = 'AbortError'
        throw err
      }
      const fullPath = path.join(dirPath, file)
      let stats: any
      try {
        stats = await fs.stat(fullPath)
      } catch (e: any) {
        if (e.name === 'AbortError') throw e
        console.error(`Error stating file ${fullPath}:`, e.message || e)
        continue
      }
      if (stats.isDirectory()) {
        if (!EXCLUDED_DIRS.has(file)) {
          await getAllFiles(fullPath, rootPath, fileList, signal)
        }
      } else {
        fileList.push(path.relative(rootPath, fullPath))
      }
    }
  } catch (e: any) {
    if (e.name === 'AbortError') throw e
    console.error(`Error reading directory ${dirPath}:`, e.message || e)
  }
  return fileList
}
